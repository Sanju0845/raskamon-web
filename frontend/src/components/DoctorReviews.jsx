import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaUser } from 'react-icons/fa';
import axios from 'axios';

const DoctorReviews = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [doctorId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/doctor/${doctorId}`
      );

      if (data.success) {
        setReviews(data.data.reviews);
        setAverageRating(data.data.averageRating);
        setTotalReviews(data.data.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, size = 'text-sm' }) => {
    return (
      <div className={`flex gap-1 ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-4">
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-8">
          <FaStar className="text-gray-300 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-500">
            Be the first to share your experience with this doctor!
          </p>
        </div>
      </div>
    );
  }

  const displayReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      {/* Header with Rating Summary */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Patient Reviews
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-800">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(averageRating)} size="text-lg" />
          </div>
          <div className="text-gray-600">
            <div className="font-semibold">{totalReviews} Reviews</div>
            <div className="text-sm">Overall Rating</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 mb-6">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => Math.round(r.rating) === star).length;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{star}</span>
                  <FaStar className="text-yellow-400 text-xs" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <div key={review._id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {review.userId?.name || 'Anonymous'}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="text-xs" />
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="ml-13">
              <FaQuoteLeft className="text-gray-300 text-xs mb-2" />
              <p className="text-gray-700 leading-relaxed">
                {review.review}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
        </button>
      )}
    </div>
  );
};

export default DoctorReviews;
