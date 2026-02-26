import testimonialModel from "../models/testimonialModel.js";
import userModel from "../models/userModel.js";

// Create a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { userId, author, role, quote, rating, isAnonymous } = req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has already submitted a testimonial
    const existingTestimonial = await testimonialModel.findOne({ userId });
    if (existingTestimonial) {
      return res
        .status(400)
        .json({ message: "You have already submitted a testimonial" });
    }

    // Create new testimonial
    const testimonial = new testimonialModel({
      userId,
      author: isAnonymous ? "Anonymous" : author,
      role: role || "Patient",
      quote,
      rating,
      isAnonymous,
    });

    await testimonial.save();

    res.status(201).json({
      message:
        "Testimonial submitted successfully! It will be reviewed and published soon.",
      testimonial,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res
      .status(500)
      .json({ message: "Error creating testimonial", error: error.message });
  }
};

// Get all approved testimonials
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialModel
      .find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ message: "Error fetching testimonials", error: error.message });
  }
};

// Get user's testimonial
export const getUserTestimonial = async (req, res) => {
  try {
    const { userId } = req.params;

    const testimonial = await testimonialModel.findOne({ userId });

    if (!testimonial) {
      return res
        .status(404)
        .json({ message: "No testimonial found for this user" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    console.error("Error fetching user testimonial:", error);
    res.status(500).json({
      message: "Error fetching user testimonial",
      error: error.message,
    });
  }
};

// Update testimonial (for users to edit their own)
export const updateTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { author, role, quote, rating, isAnonymous } = req.body;
    const { userId } = req.body; // User ID from request body for verification

    const testimonial = await testimonialModel.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Check if user owns this testimonial
    if (testimonial.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this testimonial" });
    }

    // Update fields
    testimonial.author = isAnonymous ? "Anonymous" : author;
    testimonial.role = role || "Patient";
    testimonial.quote = quote;
    testimonial.rating = rating;
    testimonial.isAnonymous = isAnonymous;
    testimonial.isApproved = false; // Reset approval status when updated

    await testimonial.save();

    res.status(200).json({
      message: "Testimonial updated successfully! It will be reviewed again.",
      testimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res
      .status(500)
      .json({ message: "Error updating testimonial", error: error.message });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { userId } = req.body; // User ID from request body for verification

    const testimonial = await testimonialModel.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Check if user owns this testimonial
    if (testimonial.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this testimonial" });
    }

    await testimonialModel.findByIdAndDelete(testimonialId);

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res
      .status(500)
      .json({ message: "Error deleting testimonial", error: error.message });
  }
};

// Admin: Get all testimonials (including pending)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialModel
      .find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res
      .status(500)
      .json({ message: "Error fetching testimonials", error: error.message });
  }
};

// Admin: Approve/Reject testimonial
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { isApproved } = req.body;

    const testimonial = await testimonialModel.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isApproved = isApproved;
    await testimonial.save();

    res.status(200).json({
      message: `Testimonial ${
        isApproved ? "approved" : "rejected"
      } successfully`,
      testimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial status:", error);
    res.status(500).json({
      message: "Error updating testimonial status",
      error: error.message,
    });
  }
};
