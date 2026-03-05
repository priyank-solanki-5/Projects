# Live Razorpay Payment Integration Setup

## 🚀 Complete Production Setup Guide

This guide will help you set up Razorpay in **LIVE MODE** for your bookstore application with full transaction support.

## 📋 Prerequisites

1. **Razorpay Account**: Sign up at [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. **Business Verification**: Complete KYC and business verification
3. **Live API Keys**: Generate live API keys from Razorpay dashboard

## 🔧 Step 1: Environment Configuration

Create a `.env` file in your `backend` directory with the following configuration:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/BookManagement

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URLs (Update with your actual production domains)
FRONTEND_URL=https://your-production-domain.com
FRONTEND_URLS=https://your-production-domain.com,https://www.your-production-domain.com

# Razorpay LIVE Configuration
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

## 🔑 Step 2: Get Live API Keys

1. **Login to Razorpay Dashboard**: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. **Navigate to Settings**: Go to Settings → API Keys
3. **Generate Live Keys**: Click "Generate Live API Keys"
4. **Copy Keys**: Copy the Key ID and Secret Key
5. **Update .env**: Replace the placeholder values in your `.env` file

## 🌐 Step 3: Configure Webhooks (Recommended)

1. **Go to Webhooks**: Settings → Webhooks
2. **Add Webhook URL**: `https://your-api-domain.com/api/payments/webhook`
3. **Select Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. **Copy Webhook Secret**: Add to your `.env` file

## 🚀 Step 4: Deploy and Test

### Backend Deployment
```bash
cd backend
npm install
npm start
```

### Frontend Deployment
```bash
cd client
npm install
npm run build
# Deploy the dist folder to your hosting service
```

## ✅ Step 5: Test Live Payments

### Test Cards for Live Mode
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

### Test UPI
- **UPI ID**: test@razorpay
- **Amount**: Any amount

## 🔍 Features Included

### ✅ Complete Payment Flow
- Order creation with pending status
- Razorpay order generation
- Payment gateway integration
- Payment verification
- Order status updates

### ✅ Multiple Payment Methods
- Credit/Debit Cards
- UPI
- Net Banking
- Wallets (Paytm, PhonePe, etc.)
- EMI options

### ✅ Error Handling
- Network error recovery
- Payment failure handling
- Timeout protection
- Retry mechanisms

### ✅ Security Features
- Server-side signature verification
- Webhook support
- Payment logging
- Fraud protection

## 📊 Monitoring and Logs

The system includes comprehensive logging for:
- Payment creation success/failure
- Payment verification results
- Error tracking and debugging
- Transaction monitoring

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid API Key"**
   - Check if you're using live keys (rzp_live_)
   - Verify key format and copy accuracy

2. **"Payment verification failed"**
   - Check webhook secret configuration
   - Verify signature generation

3. **"CORS errors"**
   - Update FRONTEND_URLS in .env
   - Check domain configuration

4. **"Script loading failed"**
   - Check internet connectivity
   - Verify CDN access
   - Check firewall settings

## 📞 Support

For Razorpay-specific issues:
- **Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Support**: [https://razorpay.com/support/](https://razorpay.com/support/)

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use HTTPS** in production
3. **Implement rate limiting**
4. **Log all payment events**
5. **Regular security audits**

## 📈 Production Checklist

- [ ] Live API keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhooks configured
- [ ] Error handling tested
- [ ] Payment flow tested
- [ ] Monitoring setup
- [ ] Backup procedures in place

---

**🎉 Your live Razorpay integration is now ready for production!**
