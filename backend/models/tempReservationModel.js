import mongoose from "mongoose";

const tempReservationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: {
      type: Object,
      ref: "User",
      required: true,
    },
    docData: {
      type: Object,
      ref: "Doctor",
      required: true,
    },
    amount: { type: Number, required: true },
    // Appointment details
    reasonForVisit: { type: String, required: true },
    sessionType: {
      type: String,
      required: true,
      enum: ["Online", "In-Person"],
    },
    communicationMethod: {
      type: String,
      enum: ["Zoom", "Google Meet", "Phone Call"],
    },
    briefNotes: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    uploadedReports: [
      {
        filename: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    consentGiven: { type: Boolean, required: true },
    // Chat summary for the appointment
    chatSummary: { type: String },
    // Payment order details
    razorpayOrderId: { type: String },
    // Expiration time (15 minutes from creation)
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cleanup queries
tempReservationSchema.index({ expiresAt: 1 });
tempReservationSchema.index({ docId: 1, slotDate: 1, slotTime: 1 });

export default mongoose.model("TempReservation", tempReservationSchema);
