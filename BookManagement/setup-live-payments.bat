@echo off
REM Live Razorpay Payment Setup Script for Windows
REM This script helps you set up live Razorpay payments for your bookstore

echo 🚀 Live Razorpay Payment Setup Script
echo ======================================

REM Check if running from correct directory
if not exist "backend\package.json" (
    echo ❌ Please run this script from the root directory of your bookstore project
    pause
    exit /b 1
)

if not exist "client\package.json" (
    echo ❌ Please run this script from the root directory of your bookstore project
    pause
    exit /b 1
)

echo ℹ️  Setting up live Razorpay payments...

REM Step 1: Check if .env file exists
if not exist "backend\.env" (
    echo ⚠️  No .env file found in backend directory
    echo ℹ️  Creating .env file for LIVE MODE...
    
    (
        echo # Database Configuration
        echo MONGO_URI=mongodb://localhost:27017/BookManagement
        echo.
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=production
        echo.
        echo # Frontend URLs ^(Update with your actual production domains^)
        echo FRONTEND_URL=https://your-production-domain.com
        echo FRONTEND_URLS=https://your-production-domain.com,https://www.your-production-domain.com
        echo.
        echo # Razorpay LIVE Configuration
        echo # Get these from: https://dashboard.razorpay.com/app/keys
        echo RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
        echo RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_SECRET_KEY
        echo.
        echo # JWT Configuration ^(Use a strong secret in production^)
        echo JWT_SECRET=your_very_strong_jwt_secret_key_for_production_change_this
        echo.
        echo # Payment Configuration
        echo RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
        echo PAYMENT_TIMEOUT=600000
        echo PAYMENT_RETRY_ATTEMPTS=3
        echo.
        echo # Security
        echo ENCRYPTION_KEY=your_encryption_key_for_production
        echo.
        echo # API Configuration
        echo VITE_API_URL=https://your-production-api-domain.com
    ) > backend\.env
    
    echo ✅ .env file created with template
) else (
    echo ✅ .env file already exists
)

REM Step 2: Install backend dependencies
echo ℹ️  Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

REM Step 3: Install frontend dependencies
echo ℹ️  Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..

REM Step 4: Create PM2 ecosystem file
echo ℹ️  Creating PM2 ecosystem configuration...
(
    echo module.exports = {
    echo   apps: [{
    echo     name: 'bookstore-api',
    echo     script: 'server.js',
    echo     cwd: './backend',
    echo     instances: 'max',
    echo     exec_mode: 'cluster',
    echo     env: {
    echo       NODE_ENV: 'production',
    echo       PORT: 5000
    echo     },
    echo     error_file: './logs/err.log',
    echo     out_file: './logs/out.log',
    echo     log_file: './logs/combined.log',
    echo     time: true
    echo   }]
    echo };
) > ecosystem.config.js
echo ✅ PM2 ecosystem file created

REM Step 5: Create logs directory
if not exist "backend\logs" mkdir backend\logs
echo ✅ Logs directory created

REM Step 6: Display next steps
echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo ==============
echo.
echo 1. 🔑 Get Live Razorpay Keys:
echo    - Go to https://dashboard.razorpay.com/
echo    - Complete KYC if not done
echo    - Go to Settings → API Keys
echo    - Generate Live API Keys
echo    - Update backend\.env with your keys
echo.
echo 2. 🌐 Configure Webhooks:
echo    - Go to Settings → Webhooks in Razorpay Dashboard
echo    - Add webhook URL: https://your-api-domain.com/api/payments/webhook
echo    - Select events: payment.captured, payment.failed, order.paid
echo    - Copy webhook secret to backend\.env
echo.
echo 3. 🚀 Deploy Your Application:
echo    - Update FRONTEND_URL and VITE_API_URL in backend\.env
echo    - Deploy backend: pm2 start ecosystem.config.js
echo    - Build frontend: cd client ^&^& npm run build
echo    - Deploy frontend to your hosting service
echo.
echo 4. 🧪 Test Live Payments:
echo    - Run: node test-live-payments.js
echo    - Test with real payment methods
echo    - Monitor payment success rates
echo.
echo 📚 Documentation:
echo =================
echo - Live Setup Guide: LIVE_RAZORPAY_SETUP.md
echo - Deployment Guide: LIVE_DEPLOYMENT_GUIDE.md
echo - Production Setup: PRODUCTION_ENV_SETUP.md
echo.
echo 🆘 Support:
echo ===========
echo - Razorpay Docs: https://razorpay.com/docs/
echo - Razorpay Support: https://razorpay.com/support/
echo.
echo ⚠️  IMPORTANT: Update your .env file with actual live Razorpay keys before going live!
echo 🔴 LIVE MODE: This application is configured for production use only!
echo.
echo ℹ️  Setup completed! Check the documentation files for detailed instructions.
echo.
pause
