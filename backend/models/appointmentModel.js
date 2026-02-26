import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    docId: { type: String, required: true },

    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },

    userData: { type: Object, ref: "User", required: true },
    docData: { type: Object, ref: "Doctor", required: true },

    amount: { type: Number, required: true },
    date: { type: Number, required: true },

    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },

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

    meetingLink: { type: String },
    meetingProvider: {
      type: String,
      enum: ["GOOGLE_MEET"],
      default: "GOOGLE_MEET",
    },
    meetingEventId: { type: String },
    briefNotes: { type: String },

    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    uploadedReports: [
      {
        filename: String,
        fileUrl: String,
        fileType: String,
        medication: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    consentGiven: { type: Boolean, required: true },

    isTemporaryReservation: { type: Boolean, default: false },

    chatSummary: { type: String },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ userId: 1 }); // For user's appointment history
appointmentSchema.index({ docId: 1 }); // For doctor's appointment list
appointmentSchema.index({ date: -1 }); // For sorting by appointment date (newest first)
appointmentSchema.index({ slotDate: 1 }); // For date-based queries
appointmentSchema.index({ cancelled: 1 }); // For filtering cancelled appointments
appointmentSchema.index({ payment: 1 }); // For payment status queries
appointmentSchema.index({ isCompleted: 1 }); // For completed appointment queries
appointmentSchema.index({ sessionType: 1 }); // For session type filtering
appointmentSchema.index({ consentGiven: 1 }); // For consent status queries

// Compound indexes for common query patterns
appointmentSchema.index({ userId: 1, date: -1 }); // For user's appointment history sorted by date
appointmentSchema.index({ docId: 1, date: -1 }); // For doctor's appointments sorted by date
appointmentSchema.index({ docId: 1, cancelled: 1 }); // For doctor's active appointments
appointmentSchema.index({ userId: 1, cancelled: 1 }); // For user's active appointments
appointmentSchema.index({ docId: 1, isCompleted: 1 }); // For doctor's completed appointments
appointmentSchema.index({ userId: 1, isCompleted: 1 }); // For user's completed appointments
appointmentSchema.index({ slotDate: 1, slotTime: 1 }); // For time slot availability checks
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 }); // For doctor's specific time slot queries
appointmentSchema.index({ payment: 1, cancelled: 1 }); // For payment analytics
appointmentSchema.index({ sessionType: 1, isCompleted: 1 }); // For session type analytics

// Text index for search functionality
appointmentSchema.index({
  reasonForVisit: "text",
  briefNotes: "text",
  "userData.name": "text",
  "docData.name": "text",
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
