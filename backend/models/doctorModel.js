import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    meetEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    languageSpoken: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    date: { type: Number, required: true },
    is_hidden: { type: Boolean, default: false },
    slots_booked: { type: Object, default: {} },
    patients: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // Doctor's weekly availability schedule (24/7 support)
    availability: {
      type: [{
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' }, // 24-hour format HH:MM
        endTime: { type: String, default: '23:30' },
        breaks: [{
          startTime: String,
          endTime: String
        }]
      }],
      default: [
        { day: 'Monday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Tuesday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Wednesday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Thursday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Friday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Saturday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] },
        { day: 'Sunday', isAvailable: true, startTime: '00:00', endTime: '23:30', breaks: [] }
      ]
    },
  },
  { minimize: false }
);

// Add comprehensive indexes for better query performance
// Note: email already has unique index from schema definition
doctorSchema.index({ speciality: 1 }); // For filtering by speciality
doctorSchema.index({ available: 1 }); // For filtering available doctors
doctorSchema.index({ date: -1 }); // For sorting by registration date
doctorSchema.index({ fees: 1 }); // For sorting by fees
doctorSchema.index({ experience: 1 }); // For experience-based queries
doctorSchema.index({ name: 1 }); // For name-based searches
doctorSchema.index({ location: "2dsphere" });

// Compound indexes for common query patterns
doctorSchema.index({ speciality: 1, available: 1 }); // For available doctors by speciality
doctorSchema.index({ speciality: 1, fees: 1 }); // For doctors by speciality and fees
doctorSchema.index({ available: 1, date: -1 }); // For available doctors sorted by registration
doctorSchema.index({ speciality: 1, experience: 1 }); // For doctors by speciality and experience
doctorSchema.index({ available: 1, fees: 1 }); // For available doctors sorted by fees

// Text index for search functionality
doctorSchema.index({
  name: "text",
  speciality: "text",
  degree: "text",
  about: "text",
});

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
