import reviewModel from '../models/reviewModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';
import mongoose from 'mongoose';

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, review } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

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

    // Debug logging
    console.log('Appointment found:', { 
      id: appointment._id, 
      userId: appointment.userId, 
      docId: appointment.docId,
      isCompleted: appointment.isCompleted,
      keys: Object.keys(appointment.toObject())
    });

    // Safety check for userId
    if (!appointment.userId) {
      return res.status(400).json({ success: false, message: 'Invalid appointment data - missing userId' });
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
      doctorId: new mongoose.Types.ObjectId(appointment.docId),
      appointmentId: new mongoose.Types.ObjectId(appointmentId),
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
    const reviews = await reviewModel.find({ doctorId }).populate('userId', 'name').sort({ createdAt: -1 }).limit(20);
    const allReviews = await reviewModel.find({ doctorId });
    const averageRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    
    res.status(200).json({
      success: true,
      data: { reviews, averageRating: Number(averageRating.toFixed(1)), totalReviews: allReviews.length }
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
    const reviews = await reviewModel.find({})
      .populate('userId', 'name email')
      .populate({ path: 'doctorId', select: 'name speciality', model: 'doctor' })
      .populate({ path: 'appointmentId', select: 'date slotDate slotTime', model: 'appointment' })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching all reviews:', error.message);
    res.status(500).json({ success: false, message: error.message });
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

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewModel.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    const doctorId = review.doctorId;
    await reviewModel.findByIdAndDelete(reviewId);
    await updateDoctorRating(doctorId);
    
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateDoctorRating = async (doctorId) => {
  try {
    const allReviews = await reviewModel.find({ doctorId });
    const averageRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    await doctorModel.findByIdAndUpdate(doctorId, { averageRating: Number(averageRating.toFixed(1)), totalReviews: allReviews.length });
  } catch (error) {
    console.error('Error updating rating:', error);
  }
};

export { createReview, getDoctorReviews, getUserReviews, getAllReviews, updateReviewStatus, deleteReview };
