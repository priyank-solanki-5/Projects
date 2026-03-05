# 🚀 Live Razorpay Deployment Guide

## Complete Production Deployment for Live Payment Processing

This guide will help you deploy your bookstore application with **fully functional live Razorpay payments** that process real transactions.

## 📋 Prerequisites

### 1. Razorpay Account Setup
- [ ] **Create Razorpay Account**: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
- [ ] **Complete KYC**: Business verification required for live mode
- [ ] **Bank Account**: Add bank account for settlements
- [ ] **Business Documents**: Upload required business documents

### 2. Technical Requirements
- [ ] **Domain**: Production domain with HTTPS
- [ ] **Server**: VPS/Cloud server (AWS, DigitalOcean, etc.)
- [ ] **Database**: MongoDB Atlas or self-hosted MongoDB
- [ ] **SSL Certificate**: Valid SSL certificate for HTTPS

## 🔧 Step 1: Environment Configuration

### Backend Environment (.env)
Create `backend/.env` with your live configuration:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/BookManagement?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URLs (Your actual production domains)
FRONTEND_URL=https://yourbookstore.com
FRONTEND_URLS=https://yourbookstore.com,https://www.yourbookstore.com

# Razorpay LIVE Configuration
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_SECRET_KEY

# JWT Configuration (Use a strong secret)
JWT_SECRET=your_very_strong_jwt_secret_key_for_production_use_random_string

# Payment Configuration
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
PAYMENT_TIMEOUT=600000
PAYMENT_RETRY_ATTEMPTS=3

# Security
ENCRYPTION_KEY=your_encryption_key_for_production

# API Configuration
VITE_API_URL=https://api.yourbookstore.com
```

### Frontend Environment (.env.production)
Create `client/.env.production`:

```env
VITE_API_URL=https://api.yourbookstore.com
```

## 🔑 Step 2: Get Live Razorpay Keys

### 1. Login to Razorpay Dashboard
- Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
- Complete business verification if not done

### 2. Generate Live API Keys
- Navigate to **Settings** → **API Keys**
- Click **Generate Live API Keys**
- Copy the **Key ID** and **Secret Key**
- Update your `.env` file

### 3. Configure Webhooks
- Go to **Settings** → **Webhooks**
- Add webhook URL: `https://api.yourbookstore.com/api/payments/webhook`
- Select events:
  - `payment.captured`
  - `payment.failed`
  - `order.paid`
- Copy the webhook secret to your `.env` file

## 🚀 Step 3: Backend Deployment

### Option A: Using PM2 (Recommended)

1. **Install PM2 globally**:
```bash
npm install -g pm2
```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'bookstore-api',
    script: 'server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

3. **Start the application**:
```bash
cd backend
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Using Docker

1. **Create Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    restart: unless-stopped
```

3. **Deploy with Docker**:
```bash
docker-compose up -d
```

## 🌐 Step 4: Frontend Deployment

### Build the Application
```bash
cd client
npm install
npm run build
```

### Deploy to Static Hosting

#### Option A: Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: `https://api.yourbookstore.com`

#### Option B: Vercel
1. Import your project
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

#### Option C: AWS S3 + CloudFront
1. Upload `dist` folder to S3 bucket
2. Configure CloudFront distribution
3. Set up custom domain

## 🔒 Step 5: SSL Certificate Setup

### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourbookstore.com -d api.yourbookstore.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Recommended)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Set SSL mode to "Full (strict)"

## 🧪 Step 6: Testing Live Payments

### 1. Run Test Script
```bash
node test-live-payments.js
```

### 2. Test Payment Flow
1. **Add items to cart**
2. **Go to checkout**
3. **Select "Online Payment"**
4. **Use test card**: 4111 1111 1111 1111
5. **Complete payment**

### 3. Verify Payment
- Check Razorpay dashboard for payment
- Verify order status in your database
- Test webhook notifications

## 📊 Step 7: Monitoring Setup

### 1. Payment Monitoring
- Monitor payment success rates
- Track failed payments
- Set up alerts for payment issues

### 2. Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Set up log rotation
- Monitor server resources

### 3. Error Tracking
- Implement error tracking (Sentry, LogRocket)
- Monitor API response times
- Track user payment failures

## 🔧 Step 8: Security Hardening

### 1. Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Install fail2ban
sudo apt install fail2ban
```

### 2. Application Security
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Regular security updates

## 📈 Step 9: Performance Optimization

### 1. Database Optimization
- Create proper indexes
- Use connection pooling
- Monitor query performance

### 2. API Optimization
- Implement caching
- Use compression
- Optimize response times

### 3. Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Optimize images

## 🚨 Step 10: Go-Live Checklist

### Pre-Launch
- [ ] Live Razorpay keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhooks configured and tested
- [ ] Payment flow tested end-to-end
- [ ] Error handling tested
- [ ] Monitoring setup
- [ ] Backup procedures in place
- [ ] Security audit completed
- [ ] Performance testing done

### Post-Launch
- [ ] Monitor payment success rates
- [ ] Check error logs regularly
- [ ] Monitor server performance
- [ ] Track user feedback
- [ ] Regular security updates

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API Key"**
   - Check if using live keys (rzp_live_)
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

### Support Resources

- **Razorpay Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Razorpay Support**: [https://razorpay.com/support/](https://razorpay.com/support/)
- **API Reference**: [https://razorpay.com/docs/api/](https://razorpay.com/docs/api/)

## 📞 Emergency Contacts

- **Razorpay Support**: support@razorpay.com
- **Technical Issues**: Check server logs and error tracking
- **Payment Issues**: Check Razorpay dashboard

---

## 🎉 Congratulations!

Your live Razorpay integration is now ready for production! 

### Quick Start Commands

```bash
# Test the integration
node test-live-payments.js

# Start backend
cd backend && pm2 start ecosystem.config.js

# Build frontend
cd client && npm run build

# Monitor logs
pm2 logs bookstore-api
```

### Important Notes

1. **Never commit API keys** to version control
2. **Use HTTPS** in production
3. **Monitor payments** regularly
4. **Keep backups** of your database
5. **Update dependencies** regularly

**🚀 Your bookstore is now ready to process real payments!**
