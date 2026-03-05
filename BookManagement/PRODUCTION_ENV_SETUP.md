# Production Environment Setup for Live Razorpay

## 🚀 Quick Setup Instructions

### 1. Create Production Environment File

Create a `.env` file in your `backend` directory with the following content:

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
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_SECRET_KEY

# JWT Configuration (Use a strong secret in production)
JWT_SECRET=your_very_strong_jwt_secret_key_for_production_change_this

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
3. **Generate Live Keys**: Go to Settings → API Keys → Generate Live API Keys
4. **Copy Keys**: Replace the placeholder values in your `.env` file

### 3. Configure Webhooks (Recommended)

1. **Go to Webhooks**: Settings → Webhooks in Razorpay Dashboard
2. **Add Webhook URL**: `https://your-api-domain.com/api/payments/webhook`
3. **Select Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. **Copy Webhook Secret**: Add to your `.env` file

### 4. Update Frontend Configuration

Update your frontend environment variables:

```env
# In client/.env or client/.env.production
VITE_API_URL=https://your-production-api-domain.com
```

### 5. Deploy and Test

#### Backend Deployment
```bash
cd backend
npm install
npm start
```

#### Frontend Deployment
```bash
cd client
npm install
npm run build
# Deploy the dist folder to your hosting service
```

## 🔧 Features Included

### ✅ Complete Live Payment System
- **Real Razorpay Integration**: Uses actual Razorpay payment gateway
- **Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets, EMI
- **Secure Processing**: Server-side signature verification
- **Webhook Support**: Real-time payment status updates
- **Error Handling**: Comprehensive error recovery
- **Retry Mechanisms**: Automatic retry on failures
- **Timeout Protection**: Prevents hanging payments

### ✅ Enhanced Security
- **Live API Keys**: Production-ready Razorpay integration
- **Webhook Verification**: Secure webhook signature validation
- **Payment Logging**: Complete audit trail
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Comprehensive data validation

### ✅ Monitoring & Analytics
- **Payment Analytics**: Revenue tracking and insights
- **Error Logging**: Detailed error tracking
- **Performance Monitoring**: Payment success rates
- **Admin Dashboard**: Payment management interface

## 🧪 Testing Live Payments

### Test Cards (Live Mode)
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

### Test UPI
- **UPI ID**: test@razorpay
- **Amount**: Any amount

## 📊 API Endpoints

### Payment Endpoints
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/payment/:paymentId` - Get payment details
- `POST /api/payments/webhook` - Razorpay webhook handler
- `GET /api/payments/all` - Get all payments (admin)
- `GET /api/payments/analytics` - Get payment analytics

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid API Key"**
   - Ensure you're using live keys (rzp_live_)
   - Check key format and copy accuracy

2. **"Payment verification failed"**
   - Verify webhook secret configuration
   - Check signature generation logic

3. **"CORS errors"**
   - Update FRONTEND_URLS in .env
   - Check domain configuration

4. **"Script loading failed"**
   - Check internet connectivity
   - Verify CDN access
   - Check firewall settings

## 🔒 Security Checklist

- [ ] Live API keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhooks configured
- [ ] Strong JWT secret
- [ ] Environment variables secured
- [ ] Payment logging enabled
- [ ] Error handling tested

## 📈 Production Checklist

- [ ] Live API keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhooks configured
- [ ] Error handling tested
- [ ] Payment flow tested
- [ ] Monitoring setup
- [ ] Backup procedures in place
- [ ] Performance optimized
- [ ] Security audit completed

---

**🎉 Your live Razorpay integration is now ready for production!**

## 📞 Support

- **Razorpay Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Razorpay Support**: [https://razorpay.com/support/](https://razorpay.com/support/)
- **API Reference**: [https://razorpay.com/docs/api/](https://razorpay.com/docs/api/)
