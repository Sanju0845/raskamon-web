const userModel = require('./models/userModel.js');
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/moodmantra');

const addCreditsToTestUser = async () => {
  try {
    // Find the test user by email
    const user = await userModel.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('User test@example.com not found');
      return;
    }
    
    console.log(`Current credits for test@example.com: ${user.credits}`);
    
    // Add 3 credits
    user.credits += 3;
    await user.save();
    
    console.log(`Successfully added 3 credits. New balance: ${user.credits}`);
    
  } catch (error) {
    console.error('Error adding credits:', error);
  } finally {
    mongoose.connection.close();
  }
};

addCreditsToTestUser();
