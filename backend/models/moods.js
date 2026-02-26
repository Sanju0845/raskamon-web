import mongoose from "mongoose";

const situationSchema = new mongoose.Schema(
  {
    situation: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emotions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one emotion is required.",
      },
    },
    intensities: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.every((v) => v >= 0 && v <= 5),
        message: "Each intensity must be between 0 and 5.",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    entry_score: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    tag_adjustment: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    final_adjusted: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    normalized_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

situationSchema.index({ situation: 1 });
situationSchema.index({ normalized_score: -1 });

const Situation = mongoose.model("moods", situationSchema);

export default Situation;
