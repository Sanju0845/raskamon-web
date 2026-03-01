import jwt from 'jsonwebtoken';
import axios from 'axios';

const testDoctorChatAPI = async () => {
  try {
    // Create a doctor token (using the first doctor's ID from our test)
    const doctorId = '699d7af567ad55071cd421ea'; // Dr. Priya Sharma
    const token = jwt.sign({ id: doctorId }, 'your_jwt_secret_here', { expiresIn: '1h' });
    
    console.log('Testing doctor chat API...');
    console.log('Doctor ID:', doctorId);
    
    // Test get doctor chats
    const response = await axios.get('http://localhost:4000/api/doctor-chat/doctor/chats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ API Response:');
    console.log('Status:', response.status);
    console.log('Chats found:', response.data.chats?.length || 0);
    
    if (response.data.chats && response.data.chats.length > 0) {
      console.log('\nFirst chat details:');
      const chat = response.data.chats[0];
      console.log('- User ID:', chat.userId);
      console.log('- User Name:', chat.userId?.name || 'Not populated');
      console.log('- User Email:', chat.userId?.email || 'Not populated');
      console.log('- Messages:', chat.messages?.length || 0);
      console.log('- Last Message:', chat.lastMessage);
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
};

testDoctorChatAPI();
