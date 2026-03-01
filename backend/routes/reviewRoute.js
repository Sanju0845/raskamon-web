import express from 'express';
import { createReview, getDoctorReviews, getUserReviews, getAllReviews, updateReviewStatus, deleteReview } from '../controllers/reviewController.js';
import authUser from '../middlewares/authUser.js';
import authAdmin from '../middlewares/authAdmin.js';

const router = express.Router();

// User routes
router.post('/create', authUser, createReview);
router.get('/user/reviews', authUser, getUserReviews);

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Admin routes (for review management)
router.get('/all', authAdmin, getAllReviews);
router.put('/:reviewId/status', authAdmin, updateReviewStatus);
router.delete('/:reviewId', authAdmin, deleteReview);

export default router;
