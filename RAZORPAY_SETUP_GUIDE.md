# Razorpay Setup Guide - Fix for the Runtime Error

## 🚨 Issue Identified
The error `'key_id' or 'oauthToken' is mandatory` occurs when Razorpay credentials are not properly configured.

## ✅ Current Status
Your `.env.local` file has Razorpay credentials set up:
```
RAZORPAY_KEY_ID=rzp_live_RBC2jPoYmAlL8e
RAZORPAY_KEY_SECRET=8FLsgKq3E69byoJsVIT4jOX5
RAZORPAY_WEBHOOK_SECRET=4gi_2L98mCgnKQL
```

## ⚠️ Important Note: Live vs Test Credentials

You're currently using **LIVE** credentials (`rzp_live_`), but for testing, you should use **TEST** credentials (`rzp_test_`).

### 🧪 For Testing (Recommended)
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to **Test Mode** (toggle in top-left)
3. Go to **Settings** → **API Keys**
4. Generate/copy **Test** API keys
5. Update your `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

### 🚀 For Production
Keep your current live credentials but only use them when deploying to production.

## 🔧 What I Fixed

### 1. Added Environment Variable Validation
```javascript
// Check if Razorpay credentials are available
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials not found.')
}
```

### 2. Safe Razorpay Initialization
```javascript
// Initialize only if credentials are available
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({...})
  : null
```

### 3. Function Safety Checks
All Razorpay functions now check if the instance is initialized before proceeding.

## 🔧 How to Test

### Step 1: Restart Development Server
```bash
npm run dev
```

### Step 2: Test the Pricing Page
1. Go to `http://localhost:3000/pricing`
2. Try to subscribe to the Monthly Plan
3. Check browser console for any errors

### Step 3: Check Razorpay Dashboard
- In test mode, you'll see test transactions
- In live mode, real money transactions occur

## 🎯 Expected Behavior

### ✅ With Test Credentials
- Subscription creation works
- No real money is charged
- Test data appears in Razorpay dashboard
- Plan `plan_RBCUZm15JCEJxq` should work

### ⚠️ With Live Credentials
- Real money transactions
- Should only be used in production
- Requires business verification

## 🛠️ Test Card Numbers (Test Mode Only)

For testing payments in test mode:
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **Any future expiry date**
- **Any 3-digit CVV**

## 🔍 Troubleshooting

### If Error Persists:
1. Check `.env.local` has correct variable names
2. Restart development server after changes
3. Clear browser cache
4. Check Razorpay dashboard for plan existence

### Check Environment Variables:
```bash
grep RAZORPAY .env.local
```

### Verify Plan Exists:
Check in Razorpay dashboard under **Subscriptions** → **Plans** for `plan_RBCUZm15JCEJxq`

## 🎉 Next Steps

1. **Switch to test credentials** for safe testing
2. **Test subscription flow** with ₹5 monthly plan
3. **Verify in Razorpay dashboard** that subscriptions are created
4. **Switch to live credentials** only for production deployment

The error should now be resolved with proper environment variable handling! 🚀
