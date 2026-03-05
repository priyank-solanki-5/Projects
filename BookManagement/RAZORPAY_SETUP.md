# Razorpay Payment Gateway Setup (LIVE MODE ONLY)

## Quick Setup Instructions

### 1. Create Environment File
Create a file named `.env` in the `backend` directory with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/BookManagement

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URLs (set to your production domains)
FRONTEND_URL=https://your-production-domain.com
FRONTEND_URLS=https://your-production-domain.com,https://www.your-production-domain.com

# Razorpay LIVE Configuration (Get these from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_LIVE_SECRET_KEY

# JWT Configuration (use a strong value)
JWT_SECRET=your_very_strong_jwt_secret_key_for_production
```

### 2. Get Live Razorpay Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate **Live API Keys**
4. Copy the **Key ID** and **Key Secret** to your `.env`

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Server
```bash
cd backend
npm start
```

## How It Works

### Payment Flow:
1. User selects Online Payment → Razorpay option
2. User clicks Pay with Razorpay → Payment gateway opens
3. Razorpay gateway loads → User pays (UPI, Cards, Wallets, Netbanking)
4. Payment is processed → Razorpay handles the payment
5. Server verifies the payment signature
6. Order status is updated to "paid"

### Features:
- ✅ Real Razorpay Integration (LIVE)
- ✅ Multiple Payment Methods
- ✅ Secure Server-side Verification
- ✅ Robust Error Handling and Fallbacks

## Troubleshooting

### Common Issues:
1. "Razorpay not configured" → Ensure `.env` has valid LIVE keys
2. "Payment gateway not loading" → Check internet and Razorpay script
3. "Payment verification failed" → Verify keys and signature logic
4. CORS errors → Ensure your production domains are allowed

### Production Checklist:
1. Use LIVE keys (`rzp_live_*`)
2. `NODE_ENV=production`
3. Update `FRONTEND_URLS` to production domains
4. Use a secure `JWT_SECRET`
