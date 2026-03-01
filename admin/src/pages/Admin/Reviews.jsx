import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "@/context/AdminContext";
import { Star, Trash2, User, Calendar, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const Reviews = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/reviews/all`,
        { headers: { atoken: aToken } }
      );
      if (data.success) {
        setReviews(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setDeleting(reviewId);
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/reviews/${reviewId}`,
        { headers: { atoken: aToken } }
      );
      if (data.success) {
        toast.success("Review deleted successfully");
        setReviews(reviews.filter(r => r._id !== reviewId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchReviews();
    }
  }, [aToken]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StarRating = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-h-[92vh] h-full overflow-y-auto p-4 md:p-6 bg-gray-50 rounded-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Doctor Reviews
          </h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {reviews.length} Reviews
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Star className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-500">
              No reviews have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.userId?.name || "Anonymous User"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Reviewed: {review.doctorId?.name || "Unknown Doctor"}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      "{review.review}"
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{review.doctorId?.speciality || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={deleting === review._id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deleting === review._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
