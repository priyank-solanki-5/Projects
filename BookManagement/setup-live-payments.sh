#!/bin/bash

# Live Razorpay Payment Setup Script
# This script helps you set up live Razorpay payments for your bookstore

echo "🚀 Live Razorpay Payment Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running from correct directory
if [ ! -f "backend/package.json" ] || [ ! -f "client/package.json" ]; then
    print_error "Please run this script from the root directory of your bookstore project"
    exit 1
fi

print_info "Setting up live Razorpay payments..."

# Step 1: Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_warning "No .env file found in backend directory"
    print_info "Creating .env file from template..."
    
    cat > backend/.env << 'EOF'
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
EOF
    
    print_status ".env file created with template"
else
    print_status ".env file already exists"
fi

# Step 2: Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
if npm install; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

# Step 3: Install frontend dependencies
print_info "Installing frontend dependencies..."
cd client
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Step 4: Create PM2 ecosystem file
print_info "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
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
EOF
print_status "PM2 ecosystem file created"

# Step 5: Create logs directory
mkdir -p backend/logs
print_status "Logs directory created"

# Step 6: Make test script executable
chmod +x test-live-payments.js
print_status "Test script made executable"

# Step 7: Display next steps
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🔑 Get Live Razorpay Keys:"
echo "   - Go to https://dashboard.razorpay.com/"
echo "   - Complete KYC if not done"
echo "   - Go to Settings → API Keys"
echo "   - Generate Live API Keys"
echo "   - Update backend/.env with your keys"
echo ""
echo "2. 🌐 Configure Webhooks:"
echo "   - Go to Settings → Webhooks in Razorpay Dashboard"
echo "   - Add webhook URL: https://your-api-domain.com/api/payments/webhook"
echo "   - Select events: payment.captured, payment.failed, order.paid"
echo "   - Copy webhook secret to backend/.env"
echo ""
echo "3. 🚀 Deploy Your Application:"
echo "   - Update FRONTEND_URL and VITE_API_URL in backend/.env"
echo "   - Deploy backend: pm2 start ecosystem.config.js"
echo "   - Build frontend: cd client && npm run build"
echo "   - Deploy frontend to your hosting service"
echo ""
echo "4. 🧪 Test Live Payments:"
echo "   - Run: node test-live-payments.js"
echo "   - Test with real payment methods"
echo "   - Monitor payment success rates"
echo ""
echo "📚 Documentation:"
echo "================="
echo "- Live Setup Guide: LIVE_RAZORPAY_SETUP.md"
echo "- Deployment Guide: LIVE_DEPLOYMENT_GUIDE.md"
echo "- Production Setup: PRODUCTION_ENV_SETUP.md"
echo ""
echo "🆘 Support:"
echo "==========="
echo "- Razorpay Docs: https://razorpay.com/docs/"
echo "- Razorpay Support: https://razorpay.com/support/"
echo ""
print_warning "Remember to update your .env file with actual live Razorpay keys before going live!"
echo ""
print_info "Setup completed! Check the documentation files for detailed instructions."
