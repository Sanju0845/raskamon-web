import mongoose from 'mongoose';
import { chatModel } from './models/chatModel.js';
import 'dotenv/config';

const testChat = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://moodmantra_user:Sanju%4001@moodmantra-test.ineqyw3.mongodb.net/moodmantra?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check existing chats
    const chats = await chatModel.find({});
    console.log(`\nFound ${chats.length} chats in database:`);
    
    chats.forEach((chat, index) => {
      console.log(`\nChat ${index + 1}:`);
      console.log(`  User ID: ${chat.userId}`);
      console.log(`  Doctor ID: ${chat.doctorId}`);
      console.log(`  Messages: ${chat.messages?.length || 0}`);
      console.log(`  Last Message: ${chat.lastMessage || 'No messages yet'}`);
      console.log(`  Active: ${chat.isActive}`);
      
      if (chat.messages && chat.messages.length > 0) {
        console.log(`  Recent messages:`);
        chat.messages.slice(-3).forEach((msg, i) => {
          console.log(`    ${msg.sender}: ${msg.message}`);
        });
      }
    });

    if (chats.length === 0) {
      console.log('\nNo chats found. Users need to initiate chats first.');
      console.log('To test: 1) Login as user, 2) Go to Experts page, 3) Click "Chat" on a doctor');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testChat();
