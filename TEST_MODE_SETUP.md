# 🧪 Test Mode Configuration Guide

## ✅ **Razorpay Test Mode Setup**

### 🎯 **Current Test Pricing:**
- **Monthly Plan**: ₹5 (instead of ₹300)
- **Yearly Plan**: ₹50 (instead of ₹3000)
- **Savings**: ₹10 (instead of ₹600)

---

## 🔧 **Environment Configuration**

### **Test Mode Detection:**
The system automatically detects test mode when:
- `NODE_ENV=development` OR
- `TESTING_MODE=true` in environment variables

### **Current Test Environment:**
```env
# .env.local
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_test_webhook_secret
```

---

## 🧪 **Testing Instructions**

### **1. Test Card Numbers:**
```
✅ Success Card: 4111 1111 1111 1111
❌ Failure Card: 4000 0000 0000 0000 0002
📱 UPI: any valid UPI ID
```

### **2. Test Scenarios:**

#### **Monthly Plan Test:**
1. Go to `/pricing`
2. Select "Monthly Plan" (₹5)
3. Click "Subscribe Now"
4. Use test card: `4111 1111 1111 1111`
5. Complete payment
6. Verify 1-month access is granted

#### **Yearly Plan Test:**
1. Go to `/pricing`
2. Select "Yearly Plan" (₹50)
3. Click "Subscribe Now"
4. Use test card: `4111 1111 1111 1111`
5. Complete payment
6. Verify 1-year access is granted

#### **Payment Failure Test:**
1. Use failure card: `4000 0000 0000 0000 0002`
2. Verify error handling
3. Check user subscription status remains unchanged

---

## 📊 **Test Mode Benefits:**

### **Safe Testing:**
- ✅ No real money transactions
- ✅ Full payment flow testing
- ✅ Webhook testing
- ✅ Error handling validation

### **Cost Effective:**
- ✅ ₹5 monthly vs ₹300 production
- ✅ ₹50 yearly vs ₹3000 production
- ✅ Perfect for development and testing

### **Realistic Testing:**
- ✅ Same payment flow as production
- ✅ Same user experience
- ✅ Same error scenarios

---

## 🔄 **Switching to Production:**

### **When Ready for Live:**
1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

2. **Pricing Automatically Updates:**
   - Monthly: ₹5 → ₹300
   - Yearly: ₹50 → ₹3000
   - Savings: ₹10 → ₹600

3. **UI Updates Automatically:**
   - Test banner disappears
   - Production pricing shows
   - Real payment processing

---

## 🎯 **Test Mode Features:**

### **Visual Indicators:**
- 🧪 Test mode banner on pricing page
- Clear pricing labels (TEST MODE: ₹5/₹50)
- Blue color scheme for test environment

### **Payment Processing:**
- Same Razorpay checkout flow
- Same payment verification
- Same subscription activation
- Same access control

### **User Experience:**
- Identical to production experience
- Same features and access
- Same subscription management
- Same dashboard functionality

---

## 📈 **Testing Checklist:**

### **Payment Flow:**
- [ ] Monthly plan payment (₹5)
- [ ] Yearly plan payment (₹50)
- [ ] Payment failure handling
- [ ] Payment verification
- [ ] Subscription activation

### **User Access:**
- [ ] Monthly access (1 month)
- [ ] Yearly access (1 year)
- [ ] Premium content access
- [ ] Subscription status display
- [ ] Access expiration handling

### **Admin Features:**
- [ ] User subscription management
- [ ] Payment history
- [ ] Subscription analytics
- [ ] Content access control

---

## 🚀 **Ready for Content Gathering:**

### **Perfect for:**
- ✅ Content development phase
- ✅ User testing and feedback
- ✅ Payment flow validation
- ✅ System stability testing
- ✅ User experience optimization

### **When to Switch to Production:**
- ✅ Content is ready
- ✅ User base is growing
- ✅ Payment flow is validated
- ✅ Business model is proven

---

## 💡 **Best Practices:**

1. **Test Regularly**: Use test mode for all development
2. **Monitor Logs**: Check payment and webhook logs
3. **User Feedback**: Gather feedback on pricing and features
4. **Content Quality**: Focus on content while in test mode
5. **Gradual Transition**: Switch to production when ready

**Test mode is perfect for your content gathering phase! 🧪✨**
