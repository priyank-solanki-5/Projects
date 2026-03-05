#!/usr/bin/env node

/**
 * LIVE MODE Razorpay Payment Integration Test Script
 * 
 * This script tests the complete payment flow with LIVE MODE Razorpay integration
 * ⚠️  WARNING: This application is configured for LIVE MODE ONLY
 * ⚠️  Test keys (rzp_test_*) will cause the application to fail
 * 
 * Run with: node test-live-payments.js
 */

import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Test configuration
const TEST_CONFIG = {
  amount: 100, // ₹1.00 in paise
  currency: 'INR',
  customer: {
    name: 'Test Customer',
    phone: '9876543210',
    email: 'test@example.com'
  }
};

console.log('🔴 Starting LIVE MODE Razorpay Payment Integration Test');
console.log('=' .repeat(60));

// Validate environment
function validateEnvironment() {
  console.log('📋 Validating Environment Configuration...');
  
  if (!RAZORPAY_KEY_ID) {
    console.error('❌ RAZORPAY_KEY_ID not found in environment');
    return false;
  }
  
  if (!RAZORPAY_KEY_SECRET) {
    console.error('❌ RAZORPAY_KEY_SECRET not found in environment');
    return false;
  }
  
  if (!RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
    console.error('❌ ERROR: Live mode requires live Razorpay keys');
    console.error('   This application is configured for LIVE MODE ONLY');
    console.error('   Please update your .env file with live keys (rzp_live_*)');
    return false;
  } else {
    console.log('✅ Live Razorpay keys detected');
  }
  
  console.log(`✅ API Base URL: ${API_BASE}`);
  console.log(`✅ Key ID: ${RAZORPAY_KEY_ID.substring(0, 10)}...`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  return true;
}

// Test API connectivity
async function testAPIConnectivity() {
  console.log('\n🌐 Testing API Connectivity...');
  
  try {
    const response = await axios.get(`${API_BASE}/api/books`, {
      timeout: 10000
    });
    
    console.log('✅ API is accessible');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response time: ${response.headers['x-response-time'] || 'N/A'}`);
    
    return true;
  } catch (error) {
    console.error('❌ API connectivity test failed');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the backend server is running on port 5000');
    }
    
    return false;
  }
}

// Test Razorpay order creation
async function testRazorpayOrderCreation() {
  console.log('\n💳 Testing Razorpay Order Creation...');
  
  try {
    const orderData = {
      amount: TEST_CONFIG.amount * 100, // Convert to paise
      currency: TEST_CONFIG.currency,
      receipt: `test_receipt_${Date.now()}`
    };
    
    console.log('   Creating order with data:', orderData);
    
    const response = await axios.post(`${API_BASE}/api/payments/create-order`, orderData, {
      timeout: 15000
    });
    
    if (response.data.success) {
      console.log('✅ Razorpay order created successfully');
      console.log(`   Order ID: ${response.data.order.id}`);
      console.log(`   Amount: ₹${response.data.order.amount / 100}`);
      console.log(`   Currency: ${response.data.order.currency}`);
      console.log(`   Environment: ${response.data.environment}`);
      
      return response.data.order;
    } else {
      console.error('❌ Order creation failed');
      console.error(`   Error: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Razorpay order creation test failed');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return null;
  }
}

// Test payment verification (simulated)
async function testPaymentVerification(order) {
  console.log('\n🔐 Testing Payment Verification...');
  
  if (!order) {
    console.error('❌ No order available for verification test');
    return false;
  }
  
  try {
    // Simulate payment verification data
    const mockPaymentData = {
      razorpay_order_id: order.id,
      razorpay_payment_id: `pay_${Date.now()}`,
      razorpay_signature: 'mock_signature_for_testing'
    };
    
    console.log('   Testing payment verification with mock data...');
    
    const response = await axios.post(`${API_BASE}/api/payments/verify-payment`, mockPaymentData, {
      timeout: 10000
    });
    
    console.log('✅ Payment verification endpoint is accessible');
    console.log(`   Response: ${response.data.message}`);
    
    return true;
  } catch (error) {
    console.error('❌ Payment verification test failed');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return false;
  }
}

// Test webhook endpoint
async function testWebhookEndpoint() {
  console.log('\n🔗 Testing Webhook Endpoint...');
  
  try {
    const webhookData = {
      event: 'payment.captured',
      entity: 'payment',
      account_id: 'test_account',
      payload: {
        payment: {
          entity: {
            id: 'pay_test123',
            order_id: 'order_test123',
            amount: 10000,
            method: 'card'
          }
        }
      }
    };
    
    console.log('   Testing webhook endpoint...');
    
    const response = await axios.post(`${API_BASE}/api/payments/webhook`, webhookData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'test_signature'
      }
    });
    
    console.log('✅ Webhook endpoint is accessible');
    console.log(`   Response: ${response.data.message}`);
    
    return true;
  } catch (error) {
    console.error('❌ Webhook endpoint test failed');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return false;
  }
}

// Test payment analytics
async function testPaymentAnalytics() {
  console.log('\n📊 Testing Payment Analytics...');
  
  try {
    const response = await axios.get(`${API_BASE}/api/payments/analytics`, {
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('✅ Payment analytics endpoint is accessible');
      console.log(`   Total payments: ${response.data.analytics.total_payments}`);
      console.log(`   Total amount: ₹${response.data.analytics.total_amount / 100}`);
      console.log(`   Successful payments: ${response.data.analytics.successful_payments}`);
      
      return true;
    } else {
      console.error('❌ Payment analytics test failed');
      console.error(`   Error: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Payment analytics test failed');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive payment integration tests...\n');
  
  const results = {
    environment: false,
    apiConnectivity: false,
    orderCreation: false,
    paymentVerification: false,
    webhook: false,
    analytics: false
  };
  
  // Run all tests
  results.environment = validateEnvironment();
  
  if (results.environment) {
    results.apiConnectivity = await testAPIConnectivity();
    
    if (results.apiConnectivity) {
      const order = await testRazorpayOrderCreation();
      results.orderCreation = order !== null;
      
      results.paymentVerification = await testPaymentVerification(order);
      results.webhook = await testWebhookEndpoint();
      results.analytics = await testPaymentAnalytics();
    }
  }
  
  // Print test results
  console.log('\n📋 Test Results Summary');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your live Razorpay integration is ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above and fix them before going live.');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Update your .env file with actual live Razorpay keys');
  console.log('2. Configure webhooks in Razorpay dashboard');
  console.log('3. Test with real payment methods');
  console.log('4. Deploy to production environment');
  
  return results;
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
