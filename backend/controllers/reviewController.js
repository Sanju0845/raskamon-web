import reviewModel from '../models/reviewModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, review } = req.body;
    const userId = req.user._id;

    if (!appointmentId || !rating || !review) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!appointment.isCompleted) {
      return res.status(400).json({ success: false, message: 'Appointment not completed' });
    }

    const existingReview = await reviewModel.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    const newReview = new reviewModel({
      userId,
      doctorId: appointment.docId,
      appointmentId,
      rating,
      review,
    });

    await newReview.save();
    await updateDoctorRating(appointment.docId);

    res.status(201).json({ success: true, message: 'Review submitted', data: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await reviewModel.find({ doctorId, isApproved: true }).populate('userId', 'name').sort({ createdAt: -1 }).limit(20);
    const approvedReviews = await reviewModel.find({ doctorId, isApproved: true });
    const averageRating = approvedReviews.length > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0;
    
    res.status(200).json({
      success: true,
      data: { reviews, averageRating: Number(averageRating.toFixed(1)), totalReviews: approvedReviews.length }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await reviewModel.find({ userId }).populate('doctorId', 'name speciality').populate('appointmentId', 'date time').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({}).populate('userId', 'name email').populate('doctorId', 'name speciality').populate('appointmentId', 'date time').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;
    const review = await reviewModel.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    review.isApproved = isApproved;
    await review.save();
    if (isApproved) await updateDoctorRating(review.doctorId);
    
    res.status(200).json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateDoctorRating = async (doctorId) => {
  try {
    const approvedReviews = await reviewModel.find({ doctorId, isApproved: true });
    const averageRating = approvedReviews.length > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0;
    await doctorModel.findByIdAndUpdate(doctorId, { averageRating: Number(averageRating.toFixed(1)), totalReviews: approvedReviews.length });
  } catch (error) {
    console.error('Error updating rating:', error);
  }
};

export { createReview, getDoctorReviews, getUserReviews, getAllReviews, updateReviewStatus };
