# 🔴 LIVE MODE SETUP - Razorpay Production Configuration

## ⚠️ IMPORTANT: This application is now configured for LIVE MODE ONLY

The application has been updated to **reject test keys** and **enforce live mode** for production use.

## 🚀 Quick Setup

### 1. Create Environment File
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/BookManagement

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URLs (Update with your actual production domains)
FRONTEND_URL=https://your-production-domain.com
FRONTEND_URLS=https://your-production-domain.com,https://www.your-production-domain.com

# Razorpay LIVE Configuration (REQUIRED)
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_SECRET_KEY

# JWT Configuration
JWT_SECRET=your_very_strong_jwt_secret_key_for_production

# Payment Configuration
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
PAYMENT_TIMEOUT=600000
PAYMENT_RETRY_ATTEMPTS=3

# Security
ENCRYPTION_KEY=your_encryption_key_for_production

# API Configuration
VITE_API_URL=https://your-production-api-domain.com
```

### 2. Get Live Razorpay Keys

1. **Login to Razorpay Dashboard**: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. **Complete KYC**: Ensure your business verification is complete
3. **Navigate to Settings**: Go to Settings → API Keys
4. **Generate Live Keys**: Click "Generate Live API Keys"
5. **Copy Keys**: Copy the Key ID and Secret Key
6. **Update .env**: Replace the placeholder values in your `.env` file

### 3. Configure Webhooks (Recommended)

1. **Go to Webhooks**: Settings → Webhooks in Razorpay Dashboard
2. **Add Webhook URL**: `https://your-api-domain.com/api/payments/webhook`
3. **Select Events**: 
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. **Copy Webhook Secret**: Add to your `.env` file

## 🔒 Security Features

### Live Mode Enforcement
- ✅ **Test keys rejected**: Application will not start with `rzp_test_` keys
- ✅ **Live keys required**: Only `rzp_live_` keys are accepted
- ✅ **Production environment**: All logging shows LIVE mode
- ✅ **Real payments only**: No test transactions possible

### Validation
- ✅ **Key format validation**: Ensures proper live key format
- ✅ **Environment detection**: Automatically detects live mode
- ✅ **Error handling**: Clear error messages for invalid keys

## 🚨 Breaking Changes

### What Changed
1. **Test mode removed**: Application no longer accepts test keys
2. **Live mode enforced**: Server will exit if test keys are detected
3. **Environment locked**: All payment processing is live mode only
4. **UI updated**: Frontend shows "LIVE MODE" status

### Migration Steps
1. **Get live keys**: Obtain live Razorpay keys from dashboard
2. **Update .env**: Replace test keys with live keys
3. **Test thoroughly**: Verify all payment flows work
4. **Deploy**: Deploy with live configuration

## 🧪 Testing Live Mode

### Before Going Live
1. **Test with small amounts**: Use real payment methods with small amounts
2. **Verify webhooks**: Ensure webhook events are received
3. **Check logs**: Monitor payment logs for any issues
4. **Test all methods**: UPI, Cards, Net Banking, Wallets

### Test Script
Run the test script to verify live mode:
```bash
node test-live-payments.js
```

## 📊 Monitoring

### Payment Logs
All payments are logged with `LIVE` environment tag:
```
[2024-01-01T12:00:00.000Z] PAYMENT_ORDER_CREATED: {
  order_id: "order_123",
  amount: 10000,
  environment: "LIVE"
}
```

### Error Handling
- **Invalid keys**: Server exits with clear error message
- **Payment failures**: Detailed error logging
- **Webhook issues**: Signature validation and logging

## 🔧 Troubleshooting

### Common Issues

1. **"Test keys not allowed"**
   - Solution: Update `.env` with live keys (`rzp_live_*`)

2. **"Invalid key format"**
   - Solution: Ensure keys start with `rzp_live_`

3. **"Payment gateway configuration error"**
   - Solution: Check all required environment variables

4. **Webhook signature invalid**
   - Solution: Verify webhook secret in `.env`

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=razorpay:*
```

## 📞 Support

- **Razorpay Docs**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Razorpay Support**: [https://razorpay.com/support/](https://razorpay.com/support/)
- **Live Mode Issues**: Check application logs for detailed error messages

## ⚡ Quick Commands

### Start Application
```bash
cd backend
npm start
```

### Test Payment
```bash
node test-live-payments.js
```

### Check Environment
```bash
node -e "console.log('Environment:', process.env.NODE_ENV)"
```

---

**🔴 REMEMBER**: This application is now configured for LIVE MODE ONLY. Test keys will cause the application to exit immediately.
