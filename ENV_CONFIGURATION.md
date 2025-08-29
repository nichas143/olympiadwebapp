# 🔧 Environment Variable Configuration Guide

## 🎯 **Test Mode Detection Options**

Your system currently detects test mode using this logic:
```typescript
const IS_TESTING = process.env.NODE_ENV === 'development' || process.env.TESTING_MODE === 'true'
const FREE_ACCESS = process.env.FREE_ACCESS === 'true'
```

This means test mode is activated when **either** condition is true, and free access is controlled separately.

---

## 📝 **Configuration Options in `.env.local`**

### **Option 1: Using NODE_ENV (Recommended)**
```env
# .env.local
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret
```

**Result:** Test mode is **ACTIVE** (₹5/₹50 pricing)

### **Option 2: Using TESTING_MODE Flag**
```env
# .env.local
NODE_ENV=production
TESTING_MODE=true
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret
```

**Result:** Test mode is **ACTIVE** (₹5/₹50 pricing)

### **Option 3: Production Mode**
```env
# .env.local
NODE_ENV=production
TESTING_MODE=false
FREE_ACCESS=false
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

**Result:** Production mode is **ACTIVE** (₹300/₹3000 pricing)

### **Option 4: Free Access Mode (Content Development)**
```env
# .env.local
NODE_ENV=development
TESTING_MODE=true
FREE_ACCESS=true
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret
```

**Result:** Free access mode is **ACTIVE** (All content free, no payment required)

---

## 🎯 **Recommended Configuration for Your Use Case**

Since you're in the content gathering phase, use **Option 1**:

```env
# .env.local
NODE_ENV=development
TESTING_MODE=true

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret

# Other configurations
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔄 **Switching Between Modes**

### **To Enable Test Mode:**
```env
NODE_ENV=development
# OR
TESTING_MODE=true
```

### **To Enable Production Mode:**
```env
NODE_ENV=production
TESTING_MODE=false
```

---

## 📊 **Mode Comparison**

| Mode | NODE_ENV | TESTING_MODE | FREE_ACCESS | Pricing | Razorpay Mode | Content Access |
|------|----------|--------------|-------------|---------|---------------|----------------|
| **Test** | `development` | `true` | `false` | ₹5/₹50 | Test | Payment Required |
| **Test** | `production` | `true` | `false` | ₹5/₹50 | Test | Payment Required |
| **Free Access** | `development` | `true` | `true` | ₹0/₹0 | Test | Free for All |
| **Production** | `production` | `false` | `false` | ₹300/₹3000 | Live | Payment Required |

---

## 🧪 **Testing Your Configuration**

### **1. Check Current Mode:**
Visit `/pricing` page and look for:
- **Test Mode**: Blue banner with "TEST MODE: ₹5/₹50"
- **Production Mode**: Green banner with "Live Pricing: ₹300/₹3000"

### **2. Verify Environment Variables:**
```bash
# Check if variables are loaded
echo $NODE_ENV
echo $TESTING_MODE
```

### **3. Restart Development Server:**
After changing `.env.local`:
```bash
npm run dev
```

---

## ⚠️ **Important Notes:**

### **Environment Variable Priority:**
1. `TESTING_MODE=true` overrides `NODE_ENV=production`
2. Both conditions activate test mode
3. Production mode requires both to be set to production values

### **Security Considerations:**
- **Never commit** `.env.local` to version control
- **Use test credentials** in development
- **Switch to live credentials** only when deploying to production

### **Vercel Deployment:**
When deploying to Vercel, set environment variables in the Vercel dashboard:
- `NODE_ENV=production`
- `TESTING_MODE=false`
- Live Razorpay credentials

---

## 🎯 **Your Current Setup Recommendation:**

For the content gathering phase, use this in your `.env.local`:

```env
# Content Development Phase Configuration
NODE_ENV=development
TESTING_MODE=true
FREE_ACCESS=true

# Razorpay Test Credentials (Get these from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_your_actual_test_key_id
RAZORPAY_KEY_SECRET=your_actual_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_actual_test_webhook_secret

# Other Required Variables
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

**This will give you ₹5/₹50 test pricing with full payment flow testing! 🧪✨**
