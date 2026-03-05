# Razorpay Production Setup Guide

## Environment Variables Required

Create a `.env` file in your backend directory with the following variables:

```bash
# Razorpay Live API Keys (Get these from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_live_secret_key

# API Configuration
VITE_API_URL=https://your-production-api-domain.com
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_for_production
ENCRYPTION_KEY=your_encryption_key_for_production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Payment Configuration
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_TIMEOUT=600000
PAYMENT_RETRY_ATTEMPTS=3
```

## Razorpay Dashboard Setup

1. **Get Live API Keys:**
   - Login to Razorpay Dashboard
   - Go to Settings > API Keys
   - Generate Live API Keys
   - Copy Key ID and Secret

2. **Configure Webhook (Optional but Recommended):**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://your-api-domain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy webhook secret

3. **Live Mode Keys:**
   - Use `rzp_live_` keys for production

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Enable HTTPS in production**
4. **Implement proper CORS policies**
5. **Add rate limiting to prevent abuse**
6. **Log payment events for audit trails**

## Common Issues and Solutions

### Script Loading Issues
- Multiple CDN fallbacks implemented
- Preloading mechanism added
- Better error handling with user-friendly messages

### Network Issues
- Retry mechanism with exponential backoff
- Fallback to cash payment option
- Timeout handling for all operations

### Payment Verification
- Server-side signature verification
- Timeout protection for verification calls
- Detailed error logging for debugging

## Testing Checklist

- [ ] Live API keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Payment gateway loads successfully
- [ ] Payment verification works
- [ ] Error handling displays proper messages
- [ ] Fallback to cash payment works
- [ ] All payment methods enabled (UPI, Cards, etc.)

## Monitoring and Logging

Add these logs to monitor payment health:
- Script loading success/failure
- Payment creation success/failure
- Payment verification success/failure
- Error rates and types
- User fallback behavior
