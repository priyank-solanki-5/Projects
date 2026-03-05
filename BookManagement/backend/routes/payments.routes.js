import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentDetails,
  handleWebhook,
  getAllPayments,
  getPaymentAnalytics,
  reportPaymentClientError,
} from "../controller/payments.controller.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createRazorpayOrder);

// Verify Razorpay payment
router.post("/verify-payment", verifyRazorpayPayment);

// Capture client-side payment failures for diagnostics
router.post("/report-client-error", reportPaymentClientError);

// Get payment details
router.get("/payment/:paymentId", getPaymentDetails);

// Webhook endpoint (no JSON parsing middleware for raw body)
router.post("/webhook", express.raw({ type: 'application/json' }), handleWebhook);

// Get all payments (for admin dashboard)
router.get("/all", getAllPayments);

// Get payment analytics
router.get("/analytics", getPaymentAnalytics);

export default router;