# Payment Flow Implementation

## Overview

This document describes the new payment flow implementation that eliminates the concept of "pending payments" and ensures appointments are only created after successful payment.

## Key Changes

### 1. Temporary Reservations

- **New Model**: `tempReservationModel.js` - Handles temporary slot reservations during payment process
- **Expiration**: Reservations expire after 15 minutes
- **Cleanup**: Automatic cleanup of expired reservations every 5 minutes

### 2. Updated Appointment Flow

#### Before (Problematic Flow):

1. User fills form → Appointment created with `payment: false`
2. User pays → Appointment updated to `payment: true`
3. **Issues**:
   - Slots blocked by unpaid appointments
   - Race conditions
   - Complex cleanup logic

#### After (Improved Flow):

1. User fills form → Temporary reservation created (15 min expiry)
2. User pays → Temporary reservation converted to confirmed appointment
3. **Benefits**:
   - No slot blocking by unpaid appointments
   - Automatic cleanup of expired reservations
   - Clear separation of concerns

## Implementation Details

### Backend Changes

#### 1. New Models

**tempReservationModel.js**:

```javascript
{
  userId: String,
  docId: String,
  slotDate: String,
  slotTime: String,
  userData: Object,
  docData: Object,
  amount: Number,
  reasonForVisit: String,
  sessionType: String,
  communicationMethod: String,
  briefNotes: String,
  emergencyContact: Object,
  consentGiven: Boolean,
  razorpayOrderId: String,
  expiresAt: Date
}
```

**Updated appointmentModel.js**:

```javascript
// New fields added:
isTemporaryReservation: Boolean,
razorpayOrderId: String,
razorpayPaymentId: String
```

#### 2. Updated Controllers

**bookAppointment**:

- Creates temporary reservation instead of appointment
- Checks for existing reservations and confirmed appointments
- Returns `tempReservationId` for payment processing

**paymentRazorpay**:

- Works with temporary reservations
- Validates reservation expiry and ownership
- Checks slot availability before payment

**verifyRazorpay**:

- Creates actual appointment from temporary reservation
- Marks slot as booked in doctor's data
- Deletes temporary reservation after successful payment

**cancelPayment**:

- Handles payment cancellation
- Cleans up temporary reservations

#### 3. Slot Availability

**getSlotAvailability**:

- Checks confirmed appointments (`payment: true`)
- Checks active temporary reservations (not expired)
- Returns combined unavailable slots

### Frontend Changes

#### 1. AppointmentForm.jsx

- Updated to work with `tempReservationId` instead of `appointmentId`
- Added payment cancellation cleanup
- Improved error handling

#### 2. Payment Flow

```javascript
// New flow:
1. Submit form → Create temporary reservation
2. Initiate payment → Use tempReservationId
3. Payment success → Convert to appointment
4. Payment failure/cancel → Clean up reservation
```

## API Endpoints

### New/Updated Endpoints

| Endpoint                                       | Method | Description                                |
| ---------------------------------------------- | ------ | ------------------------------------------ |
| `/api/user/book-appointment`                   | POST   | Creates temporary reservation              |
| `/api/user/payment-razorpay`                   | POST   | Initiates payment (uses tempReservationId) |
| `/api/user/verify-razorpay`                    | POST   | Verifies payment and creates appointment   |
| `/api/user/cancel-payment`                     | POST   | Cancels payment and cleans up reservation  |
| `/api/user/slot-availability/:docId/:slotDate` | GET    | Returns real-time slot availability        |

## Error Handling

### Common Scenarios

1. **Reservation Expired**:

   - Automatic cleanup
   - User prompted to book again

2. **Slot No Longer Available**:

   - Reservation cleaned up
   - User prompted to select different slot

3. **Payment Failure**:

   - Reservation cleaned up
   - Slot becomes available again

4. **Payment Cancellation**:
   - Reservation cleaned up
   - User can try again

## Testing

### Test Script

Run `node test-payment-flow.js` to verify:

- Temporary reservation cleanup
- Slot availability logic
- Model structure updates

### Manual Testing Steps

1. Book appointment → Verify temporary reservation created
2. Check slot availability → Should show as unavailable
3. Complete payment → Verify appointment created, reservation deleted
4. Cancel payment → Verify reservation cleaned up, slot available

## Benefits

### 1. No Pending Payments

- Eliminates confusion about unpaid appointments
- Cleaner user experience

### 2. Better Slot Management

- Slots only blocked by confirmed appointments
- Automatic cleanup prevents slot hoarding

### 3. Improved Reliability

- No race conditions
- Clear state management
- Better error handling

### 4. Scalability

- Efficient database queries
- Proper indexing on temporary reservations
- Automatic cleanup reduces database bloat

## Migration Notes

### For Existing Data

- Existing unpaid appointments should be cleaned up
- No data migration required for new flow
- Backward compatibility maintained for confirmed appointments

### Environment Variables

No new environment variables required. Uses existing:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CURRENCY`

## Monitoring

### Key Metrics to Track

1. Temporary reservation creation rate
2. Payment success rate
3. Reservation expiry rate
4. Cleanup job performance

### Logs to Monitor

- Expired reservation cleanup
- Payment verification success/failure
- Slot availability checks

## Future Enhancements

1. **Reservation Extensions**: Allow users to extend reservation time
2. **Batch Cleanup**: Optimize cleanup for high-volume scenarios
3. **Analytics**: Track booking funnel conversion rates
4. **Notifications**: Remind users about expiring reservations
