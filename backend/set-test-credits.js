import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const setTestUserCredits = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find test user and set credits to 0
    const user = await userModel.findOneAndUpdate(
      { email: 'test@example.com' },
      { credits: 0 },
      { new: true }
    );

    if (user) {
      console.log(`Updated user ${user.email}: credits set to ${user.credits}`);
    } else {
      console.log('User test@example.com not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

setTestUserCredits();
