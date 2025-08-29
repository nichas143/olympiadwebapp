# Payment Gateway Setup Guide

This guide will help you set up Razorpay payment gateway for your Olympiad webapp with yearly subscription functionality.

## Prerequisites

1. Razorpay Account: Sign up at [https://razorpay.com](https://razorpay.com)
2. Business registration (for accepting payments in India)
3. Bank account for settlements

## Razorpay Setup

### 1. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Complete your business verification
3. Add bank account details for settlements

### 2. Get API Keys

1. Navigate to **Settings** → **API Keys**
2. Generate Test/Live API keys
3. Copy `Key ID` and `Key Secret`

### 3. Create Subscription Plans

In your Razorpay dashboard:

1. Go to **Subscriptions** → **Plans**
2. Create two plans:

**Annual Plan:**
- Plan ID: `annual`
- Amount: ₹39,990 (₹399.90)
- Billing Cycle: 1 Year
- Description: "Full access to all content for 1 year"

**Student Annual Plan:**
- Plan ID: `student_annual`
- Amount: ₹19,990 (₹199.90)  
- Billing Cycle: 1 Year
- Description: "Student discount - Full access for 1 year"

### 4. Setup Webhooks

1. Go to **Settings** → **Webhooks**
2. Create webhook with URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.halted`
   - `payment.failed`
4. Copy the webhook secret

## Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_or_live_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Testing Payment Flow

### Test Mode Setup

1. **Testing Pricing**: Development environment automatically uses ₹5 for both plans
   - Set `NODE_ENV=development` for automatic test pricing
   - Or set `TESTING_MODE=true` in environment variables
   - Production will use actual pricing (₹3,999 / ₹1,999)

2. **Razorpay Test Setup**:
   - Use test API keys from Razorpay dashboard
   - Test card numbers:
     - Success: `4111 1111 1111 1111`
     - Failure: `4000 0000 0000 0000 0002`
   - Any future date for expiry
   - Any 3-digit CVV

3. **Test Payment Process**:
   - ₹5 payments are ideal for testing
   - All payment features work the same
   - Subscription activation happens instantly

### Live Mode Setup

1. Complete business verification
2. Switch to live API keys
3. Test with small amounts first
4. Monitor webhook deliveries

## Features Implemented

### ✅ Subscription Management
- Yearly subscription plans
- Student discount plans
- Free trial (14 days)
- Automatic subscription renewal

### ✅ Payment Processing
- Secure payment with Razorpay
- Payment verification
- Webhook handling for status updates
- Failed payment notifications

### ✅ Access Control
- Middleware-based subscription checking
- Premium content protection
- Trial access management
- Subscription status tracking

### ✅ User Experience
- Beautiful pricing page
- Payment confirmation page
- Subscription status dashboard
- Trial activation

## API Endpoints

- `POST /api/subscription/create` - Create new subscription order
- `POST /api/payment/verify` - Verify payment and activate subscription
- `GET /api/subscription/status` - Check subscription status
- `POST /api/subscription/trial` - Start free trial
- `POST /api/webhooks/razorpay` - Handle payment webhooks

## Pricing Strategy for Indian Market

### Recommended Pricing:
- **Annual Plan**: ₹3,999 (instead of ₹4,999) - 20% off
- **Student Plan**: ₹1,999 (instead of ₹2,999) - 33% off

### Why This Pricing Works:
1. **Affordable**: Competitive with other Indian education platforms
2. **Value Perception**: Annual discount encourages yearly commitment
3. **Student Friendly**: Special pricing for students with ID verification
4. **Psychological Pricing**: Under ₹4,000 feels more accessible

## Business Considerations

### Payment Success Rate Optimization:
1. **Multiple Payment Options**: UPI, Cards, Net Banking, Wallets
2. **Localized Experience**: Support for Indian payment methods
3. **Mobile Optimization**: Most users will pay via mobile
4. **Clear Pricing**: No hidden fees, taxes included

### Customer Support:
1. **Payment Issues**: Clear contact information
2. **Refund Policy**: 30-day money-back guarantee
3. **Technical Support**: Help with access issues
4. **Trial Support**: Smooth trial-to-paid conversion

## Security Best Practices

1. **Never store payment details** - Let Razorpay handle it
2. **Verify webhook signatures** - Prevent malicious requests
3. **Use HTTPS everywhere** - Especially for payment flows
4. **Log payment events** - For debugging and support
5. **Regular security audits** - Keep dependencies updated

## Monitoring & Analytics

### Key Metrics to Track:
1. **Conversion Rate**: Trial to paid subscription
2. **Payment Success Rate**: Monitor failed payments
3. **Churn Rate**: Subscription cancellations
4. **Revenue**: Monthly/yearly recurring revenue

### Razorpay Dashboard:
- Monitor payment success rates
- Track subscription metrics
- Download settlement reports
- View customer payment methods

## Troubleshooting

### Common Issues:

1. **Payment Failures**:
   - Check internet connectivity
   - Verify card details
   - Try different payment method
   - Contact bank for international transactions

2. **Webhook Issues**:
   - Verify webhook URL is accessible
   - Check webhook signature validation
   - Monitor webhook delivery logs

3. **Subscription Status**:
   - Database sync issues with webhooks
   - Manual subscription status updates
   - Customer support for access issues

4. **Receipt ID Validation**:
   - ✅ **Fixed**: Receipt IDs are automatically generated under 40 characters
   - Uses format: `prefix_timestamp_random` (e.g., `sub_12345678_abc123`)
   - Prevents Razorpay "receipt too long" errors

## Legal Compliance

### Required for Indian Business:
1. **GST Registration**: For tax compliance
2. **Terms of Service**: Clear subscription terms
3. **Privacy Policy**: Data handling for payments
4. **Refund Policy**: Customer protection
5. **Customer Support**: Contact information

## Next Steps

1. **Complete Razorpay verification**
2. **Test payment flow thoroughly**
3. **Set up monitoring and alerts**
4. **Prepare customer support processes**
5. **Launch with limited users first**
6. **Monitor and optimize conversion rates**

## Support

For Razorpay support:
- Email: support@razorpay.com
- Phone: +91-8951570355
- Documentation: https://razorpay.com/docs/

For webapp issues:
- Check logs in `/api/webhooks/razorpay`
- Monitor subscription status API
- Review user feedback and support tickets
