// Test script for the new payment system
// Run this with: node test-new-payments.js

import axios from "axios";

const BASE_URL = "https://bookstore-c1tt.onrender.com/api/payments";

async function testNewPaymentSystem() {
  console.log("🧪 Testing New Payment System...\n");

  try {
    // Test 1: Create payment order
    console.log("1️⃣ Testing payment order creation...");
    const orderResponse = await axios.post(`${BASE_URL}/order`, {
      amount: 10000, // ₹100 in paise
      currency: "INR",
      receipt: "test_receipt_123",
    });

    console.log("✅ Payment order created:", {
      orderId: orderResponse.data.id,
      amount: orderResponse.data.amount,
      status: orderResponse.data.status,
      gateway: orderResponse.data.gateway,
    });

    // Test 2: Process payment
    console.log("\n2️⃣ Testing payment processing...");
    const processResponse = await axios.post(`${BASE_URL}/process`, {
      orderId: orderResponse.data.id,
      amount: orderResponse.data.amount,
      customerInfo: {
        name: "Test Customer",
        phone: "9876543210",
        email: "test@example.com",
      },
    });

    console.log("✅ Payment processed:", {
      success: processResponse.data.success,
      paymentId: processResponse.data.payment_id,
      status: processResponse.data.status,
      transactionId: processResponse.data.transaction_id,
    });

    // Test 3: Verify payment
    console.log("\n3️⃣ Testing payment verification...");
    const verifyResponse = await axios.post(`${BASE_URL}/verify`, {
      order_id: orderResponse.data.id,
      payment_id: processResponse.data.payment_id,
      signature: "simulated_signature",
    });

    console.log("✅ Payment verified:", {
      valid: verifyResponse.data.valid,
      orderId: verifyResponse.data.order_id,
      paymentId: verifyResponse.data.payment_id,
      gateway: verifyResponse.data.gateway,
    });

    // Test 4: Check payment status
    console.log("\n4️⃣ Testing payment status check...");
    const statusResponse = await axios.get(
      `${BASE_URL}/status/${orderResponse.data.id}`
    );
    console.log("✅ Payment status:", statusResponse.data);

    console.log(
      "\n🎉 All tests passed! New payment system is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testNewPaymentSystem();
