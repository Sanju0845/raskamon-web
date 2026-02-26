// Test script for the new payment flow
// This script tests the temporary reservation and payment flow

import mongoose from "mongoose";
import tempReservationModel from "./models/tempReservationModel.js";
import appointmentModel from "./models/appointmentModel.js";
import doctorModel from "./models/doctorModel.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const testPaymentFlow = async () => {
  try {
    console.log("🧪 Testing new payment flow...");

    // Test 1: Check if temporary reservations are cleaned up
    const expiredReservations = await tempReservationModel.find({
      expiresAt: { $lt: new Date() },
    });
    console.log(`📊 Found ${expiredReservations.length} expired reservations`);

    // Test 2: Check slot availability logic
    const testDocId = "test-doctor-id";
    const testSlotDate = "01/01/2024";
    const testSlotTime = "10:00";

    // Check for booked slots
    const doctor = await doctorModel.findById(testDocId);
    const bookedSlots = doctor?.slots_booked?.[testSlotDate] || [];

    // Check for active reservations
    const activeReservations = await tempReservationModel.find({
      docId: testDocId,
      slotDate: testSlotDate,
      expiresAt: { $gt: new Date() },
    });
    const reservedSlots = activeReservations.map((r) => r.slotTime);

    // Check for confirmed appointments
    const confirmedAppointments = await appointmentModel.find({
      docId: testDocId,
      slotDate: testSlotDate,
      slotTime: testSlotTime,
      payment: true,
      cancelled: false,
    });

    console.log(`📊 Slot availability test:`);
    console.log(`   - Booked slots: ${bookedSlots.length}`);
    console.log(`   - Reserved slots: ${reservedSlots.length}`);
    console.log(`   - Confirmed appointments: ${confirmedAppointments.length}`);

    // Test 3: Check appointment model structure
    const appointment = await appointmentModel.findOne();
    if (appointment) {
      console.log(`📊 Appointment model has new fields:`);
      console.log(
        `   - isTemporaryReservation: ${appointment.isTemporaryReservation}`
      );
      console.log(
        `   - razorpayOrderId: ${appointment.razorpayOrderId ? "Yes" : "No"}`
      );
      console.log(
        `   - razorpayPaymentId: ${
          appointment.razorpayPaymentId ? "Yes" : "No"
        }`
      );
    }

    console.log("✅ Payment flow test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPaymentFlow();
}

export default testPaymentFlow;
