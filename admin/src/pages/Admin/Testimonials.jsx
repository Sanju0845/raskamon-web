import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AdminContext.jsx";

const Testimonials = () => {
  const { aToken, backendUrl } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const fetchTestimonials = async () => {
    try {
      console.log(
        "Fetching testimonials with token:",
        aToken ? "Token present" : "No token"
      );
      console.log("Backend URL:", backendUrl);

      const response = await fetch(`${backendUrl}/api/testimonials/all`, {
        headers: {
          atoken: aToken,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        throw new Error(
          `Failed to fetch testimonials: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Testimonials data:", data);
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Admin token from context:", aToken ? "Present" : "Missing");
    console.log("Backend URL from context:", backendUrl);
    console.log(
      "Token from localStorage:",
      localStorage.getItem("aToken") ? "Present" : "Missing"
    );

    if (aToken) {
      fetchTestimonials();
    } else {
      console.log("No admin token found, skipping testimonials fetch");
      setLoading(false);
    }
  }, [aToken, backendUrl]); // Added backendUrl to dependencies

  const handleStatusUpdate = async (testimonialId, isApproved) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/testimonials/${testimonialId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            atoken: aToken,
          },
          body: JSON.stringify({ isApproved }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update testimonial status");
      }

      const data = await response.json();
      toast.success(data.message);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial status:", error);
      toast.error("Failed to update testimonial status");
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/testimonials/${testimonialId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            atoken: aToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }

      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (filter === "all") return true;
    if (filter === "pending") return !testimonial.isApproved;
    if (filter === "approved") return testimonial.isApproved;
    return false;
  });

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaEye className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Testimonials Management
        </h1>
        <p className="text-gray-600">Manage and moderate user testimonials</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          {[
            { key: "all", label: "All", count: testimonials.length },
            {
              key: "pending",
              label: "Pending",
              count: testimonials.filter((t) => !t.isApproved).length,
            },
            {
              key: "approved",
              label: "Approved",
              count: testimonials.filter((t) => t.isApproved).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <motion.div
            key={testimonial._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {testimonial.author}
                    </h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                {getStatusBadge(testimonial.isApproved)}
              </div>

              {/* Rating */}
              <div className="mb-4">
                <RatingStars rating={testimonial.rating} />
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-4 line-clamp-3">
                "{testimonial.quote}"
              </p>

              {/* User Info */}
              <div className="text-sm text-gray-500 mb-4">
                <p>User: {testimonial.userId?.name || "Unknown"}</p>
                <p>Email: {testimonial.userId?.email || "Unknown"}</p>
                <p>
                  Submitted:{" "}
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {!testimonial.isApproved ? (
                  <button
                    onClick={() => handleStatusUpdate(testimonial._id, true)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaCheck className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(testimonial._id, false)}
                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <FaEyeSlash className="w-4 h-4 mr-1" />
                    Unapprove
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTestimonial(testimonial);
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaEye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(testimonial._id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No testimonials found</p>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Testimonial Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedTestimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedTestimonial.author}
                    </h3>
                    <p className="text-gray-500">{selectedTestimonial.role}</p>
                  </div>
                </div>

                <div>
                  <RatingStars rating={selectedTestimonial.rating} />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Testimonial:
                  </h4>
                  <p className="text-gray-700 italic">
                    "{selectedTestimonial.quote}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      User Name:
                    </span>
                    <p className="text-gray-600">
                      {selectedTestimonial.userId?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      User Email:
                    </span>
                    <p className="text-gray-600">
                      {selectedTestimonial.userId?.email || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      Submitted:
                    </span>
                    <p className="text-gray-600">
                      {new Date(selectedTestimonial.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedTestimonial.isApproved)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  {!selectedTestimonial.isApproved ? (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedTestimonial._id, true);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedTestimonial._id, false);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Unapprove
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleDelete(selectedTestimonial._id);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
