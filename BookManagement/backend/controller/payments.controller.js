import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Razorpay configuration with enhanced live mode support
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET;

// Validate configuration
if (!key_id || !key_secret) {
  console.error("❌ Razorpay configuration error: Missing API keys");
  console.error("Please check your .env file and ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set");
}

// Enforce live mode - reject test keys in production
if (key_id && key_id.startsWith('rzp_test_')) {
  console.error("❌ PRODUCTION MODE: Test keys are not allowed in live environment");
  console.error("Please update your .env file with live Razorpay keys (rzp_live_*)");
  process.exit(1);
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id,
  key_secret,
});

// Payment logging utility
const logPaymentEvent = (event, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] PAYMENT_${event.toUpperCase()}:`, {
    ...data,
    environment: 'LIVE'
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be greater than 0",
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(Number(amount));

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    if (!key_id || !key_secret) {
      console.error("Razorpay configuration error: Missing API keys");
      return res.status(500).json({
        success: false,
        message: "Payment gateway configuration error. Please contact support.",
        error_code: "PAYMENT_CONFIG_ERROR"
      });
    }

    // Validate key format - enforce live mode only
    if (!key_id.startsWith('rzp_live_')) {
      console.error("Invalid Razorpay key format for production:", key_id);
      return res.status(500).json({
        success: false,
        message: "Invalid payment gateway configuration. Live mode keys required.",
        error_code: "INVALID_KEY_FORMAT"
      });
    }

    console.log("Creating Razorpay order with options:", {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      key_id: key_id.substring(0, 10) + "..." // Log partial key for security
    });

    try {
      const order = await razorpay.orders.create(options);

      console.log("Razorpay order created successfully:", {
        order_id: order.id,
        amount: order.amount,
        status: order.status
      });

      res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at,
        },
        key_id: key_id, // Return key_id for frontend
        environment: 'live'
      });
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
      
      // Handle specific Razorpay errors
      if (razorpayError.error) {
        return res.status(400).json({
          success: false,
          message: "Payment order creation failed: " + (razorpayError.error.description || "Unknown error"),
          error_code: razorpayError.error.code || "RAZORPAY_ERROR",
          details: razorpayError.error
        });
      }
      
      throw razorpayError; // Re-throw if not a Razorpay-specific error
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    // Create signature for verification
    if (!key_secret) {
      console.error("Razorpay secret not configured for payment verification");
      return res.status(500).json({
        success: false,
        message: "Payment verification configuration error. Please contact support.",
        error_code: "VERIFICATION_CONFIG_ERROR"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body)
      .digest("hex");

    const isValidSignature = expectedSignature === razorpay_signature;

    console.log("Payment verification attempt:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature_valid: isValidSignature,
      timestamp: new Date().toISOString()
    });

    // Additional security: Validate signature format
    if (!razorpay_signature || typeof razorpay_signature !== 'string' || razorpay_signature.length !== 64) {
      console.error("Invalid signature format:", razorpay_signature);
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature format",
        error_code: "INVALID_SIGNATURE_FORMAT",
        verified: false
      });
    }

    if (isValidSignature) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        verified: true,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        verified: false,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    logPaymentEvent('FETCH_PAYMENT', { paymentId });

    const payment = await razorpay.payments.fetch(paymentId);

    logPaymentEvent('PAYMENT_FETCHED', {
      paymentId,
      status: payment.status,
      amount: payment.amount,
      method: payment.method
    });

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        captured: payment.captured,
        description: payment.description,
        notes: payment.notes,
        fee: payment.fee,
        tax: payment.tax,
        error_code: payment.error_code,
        error_description: payment.error_description,
      },
    });
  } catch (error) {
    logPaymentEvent('PAYMENT_FETCH_ERROR', { paymentId, error: error.message });
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

// Webhook handler for Razorpay events
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    if (!signature || !webhook_secret) {
      logPaymentEvent('WEBHOOK_ERROR', { error: 'Missing signature or webhook secret' });
      return res.status(400).json({
        success: false,
        message: "Missing signature or webhook secret"
      });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logPaymentEvent('WEBHOOK_SIGNATURE_INVALID', { 
        received: signature.substring(0, 10) + '...',
        expected: expectedSignature.substring(0, 10) + '...'
      });
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature"
      });
    }

    const event = req.body;
    logPaymentEvent('WEBHOOK_RECEIVED', {
      event: event.event,
      entity: event.entity,
      account_id: event.account_id
    });

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      default:
        logPaymentEvent('WEBHOOK_UNHANDLED_EVENT', { event: event.event });
    }

    res.json({ success: true, message: "Webhook processed successfully" });

  } catch (error) {
    logPaymentEvent('WEBHOOK_ERROR', { error: error.message });
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// Handle payment captured webhook
const handlePaymentCaptured = async (event) => {
  try {
    const payment = event.payload.payment.entity;
    logPaymentEvent('PAYMENT_CAPTURED', {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      method: payment.method
    });

    // Here you can add logic to update your database
    // For example, update order status to 'paid'
    console.log(`Payment ${payment.id} captured for order ${payment.order_id}`);
    
  } catch (error) {
    logPaymentEvent('PAYMENT_CAPTURED_ERROR', { error: error.message });
    console.error("Error handling payment captured:", error);
  }
};

// Handle payment failed webhook
const handlePaymentFailed = async (event) => {
  try {
    const payment = event.payload.payment.entity;
    logPaymentEvent('PAYMENT_FAILED', {
      paymentId: payment.id,
      orderId: payment.order_id,
      errorCode: payment.error_code,
      errorDescription: payment.error_description
    });

    // Here you can add logic to update your database
    // For example, update order status to 'failed'
    console.log(`Payment ${payment.id} failed for order ${payment.order_id}`);
    
  } catch (error) {
    logPaymentEvent('PAYMENT_FAILED_ERROR', { error: error.message });
    console.error("Error handling payment failed:", error);
  }
};

// Handle order paid webhook
const handleOrderPaid = async (event) => {
  try {
    const order = event.payload.order.entity;
    logPaymentEvent('ORDER_PAID', {
      orderId: order.id,
      amount: order.amount,
      status: order.status
    });

    // Here you can add logic to update your database
    console.log(`Order ${order.id} marked as paid`);
    
  } catch (error) {
    logPaymentEvent('ORDER_PAID_ERROR', { error: error.message });
    console.error("Error handling order paid:", error);
  }
};

// Get all payments (for admin dashboard)
export const getAllPayments = async (req, res) => {
  try {
    const { count = 10, skip = 0 } = req.query;
    
    logPaymentEvent('FETCH_ALL_PAYMENTS', { count, skip });

    const payments = await razorpay.payments.all({
      count: parseInt(count),
      skip: parseInt(skip)
    });

    logPaymentEvent('ALL_PAYMENTS_FETCHED', { 
      count: payments.items.length,
      total: payments.count 
    });

    res.json({
      success: true,
      payments: payments.items,
      count: payments.count,
      has_more: payments.items.length === parseInt(count)
    });

  } catch (error) {
    logPaymentEvent('ALL_PAYMENTS_ERROR', { error: error.message });
    console.error("Error fetching all payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    logPaymentEvent('FETCH_ANALYTICS', { from, to });

    // Get payments for the specified date range
    const payments = await razorpay.payments.all({
      from: from ? new Date(from).getTime() / 1000 : undefined,
      to: to ? new Date(to).getTime() / 1000 : undefined,
      count: 100
    });

    // Calculate analytics
    const analytics = {
      total_payments: payments.items.length,
      total_amount: payments.items.reduce((sum, payment) => sum + payment.amount, 0),
      successful_payments: payments.items.filter(p => p.status === 'captured').length,
      failed_payments: payments.items.filter(p => p.status === 'failed').length,
      pending_payments: payments.items.filter(p => p.status === 'authorized').length,
      payment_methods: {},
      daily_stats: {}
    };

    // Payment method breakdown
    payments.items.forEach(payment => {
      const method = payment.method || 'unknown';
      analytics.payment_methods[method] = (analytics.payment_methods[method] || 0) + 1;
    });

    logPaymentEvent('ANALYTICS_CALCULATED', analytics);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logPaymentEvent('ANALYTICS_ERROR', { error: error.message });
    console.error("Error fetching payment analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics",
      error: error.message,
    });
  }
};

// Report client-side payment issues for debugging mobile failures
export const reportPaymentClientError = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      paymentFlow = "standard",
      error = {},
      customer = {},
      deviceInfo = {},
      extra = {},
    } = req.body || {};

    logPaymentEvent("CLIENT_ERROR", {
      orderId,
      razorpayOrderId,
      paymentFlow,
      errorCode: error.code,
      errorDescription: error.description,
      errorReason: error.reason,
      errorSource: error.source,
      errorStep: error.step,
      metadata: error.metadata,
      customerPhone: customer.phone,
      customerName: customer.name,
      customerEmail: customer.email,
      deviceInfo,
      extra,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error recording client payment issue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment issue",
    });
  }
};