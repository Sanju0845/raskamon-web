import mongoose from 'mongoose';
import doctorModel from './models/doctorModel.js';
import 'dotenv/config';

const getDoctorCredentials = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://moodmantra_user:Sanju%4001@moodmantra-test.ineqyw3.mongodb.net/moodmantra?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all doctors
    const doctors = await doctorModel.find({}).select('name email speciality');
    
    if (doctors.length === 0) {
      console.log('No doctors found in the database');
      return;
    }

    console.log('\n=== EXISTING DOCTOR CREDENTIALS ===\n');
    
    doctors.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}:`);
      console.log(`  Name: Dr. ${doctor.name}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Speciality: ${doctor.speciality}`);
      console.log(`  Doctor ID: ${doctor._id}`);
      console.log(`  Default Password: doctor123`);
      console.log('----------------------------------------');
    });

    console.log(`\nTotal doctors found: ${doctors.length}`);
    console.log('\nLogin URL: http://localhost:5174/login (select Doctor login)');
    console.log('Use the email and default password: doctor123\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

getDoctorCredentials();
