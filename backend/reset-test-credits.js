import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const resetTestUserCredits = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Reset credits to 0 for test user
    const result = await userModel.updateOne(
      { email: 'test@example.com' },
      { $set: { credits: 0 } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Test user credits reset to 0');
    } else {
      console.log('User not found or already at 0 credits');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetTestUserCredits();
