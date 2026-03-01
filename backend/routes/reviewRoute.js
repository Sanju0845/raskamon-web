import express from 'express';
import { createReview, getDoctorReviews, getUserReviews, getAllReviews, updateReviewStatus } from '../controllers/reviewController.js';
import authUser from '../middlewares/authUser.js';
import authDoctor from '../middlewares/authDoctor.js';

const router = express.Router();

// User routes
router.post('/create', authUser, createReview);
router.get('/user/reviews', authUser, getUserReviews);

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Admin routes (for review management)
router.get('/all', authDoctor, getAllReviews);
router.put('/:reviewId/status', authDoctor, updateReviewStatus);

export default router;
