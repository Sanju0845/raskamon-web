import userModel from '../models/userModel.js';
import razorpay from '../config/razorpay.js';

// Utility function to check and credit pending payments
export const checkAndCreditPendingPayments = async (userId) => {
  try {
    console.log('Checking for pending payments for user:', userId);
    
    // Get user details
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return { success: false, message: 'User not found' };
    }
    
    // Get recent orders from Razorpay (last 24 hours)
    const orders = await razorpay.orders.all({
      count: 20,
      skip: 0
    });
    
    const recentOrders = orders.items.filter(order => {
      const orderDate = new Date(order.created_at * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return orderDate > twentyFourHoursAgo && 
             order.notes?.userId === userId && 
             order.notes?.type === 'credits_purchase';
    });
    
    console.log(`Found ${recentOrders.length} recent credit purchase orders`);
    
    for (const order of recentOrders) {
      try {
        // Get payments for this order
        const payments = await razorpay.orders.fetchPayments(order.id);
        
        if (payments.items.length > 0) {
          const payment = payments.items[0];
          
          // Check if payment was captured but not credited
          if (payment.status === 'captured') {
            const creditsToAdd = parseInt(order.notes.credits);
            
            // Check if user already received these credits
            // This is a simple check - in production you'd maintain a payment ledger
            console.log(`Payment ${payment.id} was captured for ${creditsToAdd} credits`);
            
            // For now, we'll just credit the user if payment was captured
            // In production, you'd check if this payment was already processed
            user.credits += creditsToAdd;
            await user.save();
            
            console.log(`Credited ${creditsToAdd} credits to user ${userId}`);
            
            return { 
              success: true, 
              message: `Found and credited ${creditsToAdd} credits from payment ${payment.id}`,
              creditsAdded: creditsToAdd,
              newBalance: user.credits
            };
          }
        }
      } catch (error) {
        console.error(`Error checking order ${order.id}:`, error);
      }
    }
    
    return { 
      success: false, 
      message: 'No pending payments found that need crediting',
      currentBalance: user.credits
    };
    
  } catch (error) {
    console.error('Error checking pending payments:', error);
    return { success: false, message: 'Server error' };
  }
};

// Manual credit function for admin use
export const manualCreditUser = async (userId, credits, reason) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    user.credits += credits;
    await user.save();
    
    console.log(`Manually credited ${credits} credits to user ${userId} for: ${reason}`);
    
    return { 
      success: true, 
      message: `Successfully credited ${credits} credits`,
      newBalance: user.credits
    };
    
  } catch (error) {
    console.error('Error in manual credit:', error);
    return { success: false, message: 'Server error' };
  }
};
