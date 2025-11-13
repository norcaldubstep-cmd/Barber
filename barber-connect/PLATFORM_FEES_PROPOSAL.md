# Platform Booking Fees - Implementation Proposal

## Current Status
- Fee calculation functions exist in `featureEnforcementService.ts`
- NOT yet integrated into booking flow
- Booking type doesn't include fee fields

## Proposed Fee Structure

### Tier-Based Fees (FAIR & COMPETITIVE)

| Tier | Monthly Cost | Booking Fee | Effective Cost (50 bookings/mo @ $40 avg) |
|------|--------------|-------------|--------------------------------------------|
| Free | $0 | 15% | $300/mo in fees |
| Professional | $29.99 | 10% | $229.99 total ($29.99 + $200 fees) |
| Premium | $49.99 | 5% | $149.99 total ($49.99 + $100 fees) |
| Elite | $99.99 | 0% | $99.99 total (subscription only) |
| Enterprise | $199.99 | 0% | $199.99 total (subscription only) |

### Why This Is Fair

1. **Better than competitors**: Most platforms charge 20% commission
2. **Lower total cost at scale**: Busy barbers save money with higher tiers
3. **Predictable pricing**: Barbers can calculate exact costs
4. **Rewards growth**: As barbers grow, they can reduce fees
5. **No lock-in**: Free tier has no commitment

### Break-Even Analysis

**When to upgrade from Free → Professional:**
- Free tier: 15% of revenue
- Professional: $29.99 + 10% of revenue
- Upgrade when: 15% × revenue = $29.99 + 10% × revenue
- **Break-even: $600/month in bookings (15 bookings @ $40)**

**When to upgrade from Professional → Premium:**
- Professional: $29.99 + 10% of revenue
- Premium: $49.99 + 5% of revenue
- Upgrade when: $29.99 + 10% × revenue = $49.99 + 5% × revenue
- **Break-even: $400/month in bookings (10 bookings @ $40)**

**When to upgrade from Premium → Elite:**
- Premium: $49.99 + 5% of revenue
- Elite: $99.99 + 0% of revenue
- Upgrade when: $49.99 + 5% × revenue = $99.99
- **Break-even: $1,000/month in bookings (25 bookings @ $40)**

## Implementation Plan

### Phase 1: Update Booking Type

```typescript
export interface Booking {
  // ... existing fields ...

  // NEW: Fee structure
  totalPrice: number;           // Total service cost
  platformFee: number;          // Fee charged by platform
  platformFeePercentage: number; // Fee percentage at booking time
  barberPayout: number;         // Amount barber receives
  processingFee?: number;       // Stripe/payment processor fee
  netPayout: number;            // Final payout after all fees

  // NEW: Payment tracking
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;     // Stripe payment ID
  paidAt?: Date;
  payoutStatus?: 'pending' | 'processing' | 'paid' | 'failed';
  payoutId?: string;
}
```

### Phase 2: Update createBooking Function

```typescript
export const createBooking = async (...) => {
  // Calculate totals
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  // NEW: Calculate platform fees
  const feePercentage = await getBookingFeePercentage(barberId);
  const platformFee = totalPrice * feePercentage;
  const barberPayout = totalPrice - platformFee;

  const bookingData: Booking = {
    // ... existing fields ...
    totalPrice,
    platformFee,
    platformFeePercentage: feePercentage,
    barberPayout,
    netPayout: barberPayout, // Before processing fees
    paymentStatus: 'pending',
  };

  await setDoc(bookingRef, bookingData);

  // NEW: Track booking in analytics
  await trackBookingReceived(barberId, totalPrice, platformFee);

  return bookingData;
};
```

### Phase 3: Payment Processing

```typescript
// When client pays for booking
export const processBookingPayment = async (
  bookingId: string,
  paymentMethodId: string
) => {
  const booking = await getBookingById(bookingId);

  // Create payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.totalPrice * 100, // Convert to cents
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true,
    metadata: {
      bookingId: booking.id,
      barberId: booking.barberId,
      platformFee: booking.platformFee,
      barberPayout: booking.barberPayout,
    },
    // Use Stripe Connect to split payment
    transfer_data: {
      amount: booking.barberPayout * 100, // Barber's cut
      destination: barberStripeAccountId,
    },
  });

  // Update booking
  await updateDoc(doc(db, 'bookings', bookingId), {
    paymentStatus: 'paid',
    paymentIntentId: paymentIntent.id,
    paidAt: serverTimestamp(),
  });
};
```

### Phase 4: Payout Dashboard

Create a screen for barbers to see:
- Total bookings this month
- Gross revenue
- Platform fees paid
- Net payout
- Payout schedule (weekly/monthly)
- Savings compared to lower tier

## Alternative Models to Consider

### Option 1: Flat Monthly Fee (Like Schedulicity)
- All tiers: $29-199/mo, NO booking fees
- **Pros**: Simple, predictable
- **Cons**: Less fair for low-volume barbers, less revenue potential

### Option 2: Hybrid Model (Current - RECOMMENDED)
- Tier-based with decreasing fees
- **Pros**: Fair for all volumes, incentivizes growth, maximum flexibility
- **Cons**: Slightly more complex to explain

### Option 3: Pure Commission (Like Styleseat)
- No monthly fee, 15-20% commission on all bookings
- **Pros**: No upfront cost
- **Cons**: Expensive at scale, less predictable

## Recommendation

**Stick with the current hybrid tier-based model** because:

1. ✅ Most fair across all barber sizes
2. ✅ Incentivizes platform loyalty and upgrades
3. ✅ Competitive with industry standards
4. ✅ Allows barbers to optimize costs as they grow
5. ✅ Platform earns revenue from both subscriptions and transactions
6. ✅ Clear upgrade path with transparent ROI

## User Communication

When showing fees to barbers:

```
You'll earn $47.50 from this $50 booking
  Service price:     $50.00
  Platform fee (5%): -$2.50
  Your payout:       $47.50

💡 Upgrade to Elite to eliminate all booking fees!
```

## Next Steps

1. Update booking.types.ts with fee fields
2. Integrate fee calculations into createBooking()
3. Add payment processing with Stripe Connect
4. Create payout dashboard for barbers
5. Add fee transparency in booking confirmation
6. Test fee calculations across all tiers
7. Update Firestore security rules for fee fields
