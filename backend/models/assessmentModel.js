// backend/models/assessmentModel.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      value: { type: Number, required: true },
    },
  ],
  category: { type: String, required: true },
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  therapyType: {
    type: String,
    enum: ["individual", "couple", "family", "child"],
    default: "individual",
    index: true,
  },
  questions: [questionSchema],
  scoringRanges: [
    {
      minScore: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      result: { type: String, required: true },
      recommendations: [{ type: String }],
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const userAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  title: { type: String, required: true },
  therapyType: {
    type: String,
    required: true,
  },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      selectedOption: { type: Number, required: true },
    },
  ],
  totalScore: { type: Number, required: true },
  result: { type: String, required: true },
  recommendations: [{ type: String }],
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, default: Date.now },
});

// Add indexes for Assessment model
assessmentSchema.index({ isActive: 1 }); // For filtering active assessments
assessmentSchema.index({ createdAt: -1 }); // For sorting by creation date
assessmentSchema.index({ updatedAt: -1 }); // For sorting by update date
assessmentSchema.index({ title: 1 }); // For title-based searches
assessmentSchema.index({ therapyType: 1, isActive: 1 }); // For therapy-specific queries

// Text index for search functionality
assessmentSchema.index({
  title: "text",
  description: "text",
});

// Add indexes for UserAssessment model
userAssessmentSchema.index({ userId: 1 }); // For user's assessment history
userAssessmentSchema.index({ assessmentId: 1 }); // For assessment-specific results
userAssessmentSchema.index({ completedAt: -1 }); // For sorting by completion date
userAssessmentSchema.index({ totalScore: -1 }); // For score-based sorting
userAssessmentSchema.index({ result: 1 }); // For result-based filtering

// Compound indexes for common query patterns
userAssessmentSchema.index({ userId: 1, completedAt: -1 }); // For user's assessment history sorted by date
userAssessmentSchema.index({ userId: 1, assessmentId: 1 }); // For specific user-assessment combinations
userAssessmentSchema.index({ assessmentId: 1, completedAt: -1 }); // For assessment results sorted by date
userAssessmentSchema.index({ assessmentId: 1, totalScore: -1 }); // For assessment results sorted by score
userAssessmentSchema.index({ userId: 1, result: 1 }); // For user's results by category

export const Assessment = mongoose.model("Assessment", assessmentSchema);
export const UserAssessment = mongoose.model(
  "UserAssessment",
  userAssessmentSchema
);
