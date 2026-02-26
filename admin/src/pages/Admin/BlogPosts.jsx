import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "@/context/AdminContext";
import {
  Check,
  X,
  FileText,
  User,
  Calendar,
  Clock,
  Eye,
  Star,
  Loader2,
  AlertCircle,
  Edit,
  Send,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressBar from "@/components/ProgressBar";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import axios from "axios";
const BlogPosts = () => {
  const {
    aToken,
    pendingPosts,
    pendingPostsCount,
    getPendingBlogPosts,
    reviewBlogPost,
    backendUrl,
    pendingBlogPage,
    pendingBlogPagination,
    handlePendingNext,
    handlePendingPrev,
  } = useContext(AdminContext);

  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState("pending");
  const [approvedBlog, setApprovedBlog] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [pagination, setPagination] = useState({});
  const [total, setTotalPost] = useState(0);

  // loader progress simulation
  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const fetchPendingPosts = async () => {
    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      await getPendingBlogPosts();

      setLoadingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  // Blog post management functions
  const getAporovedBlogPosts = async () => {
    try {
      const { data } = await axios.get(
        backendUrl +
          `/api/blog-posts/admin/approved?page=${page}&limit=${limit}`,
        { headers: { aToken } }
      );

      if (data.success) {
        setApprovedBlog(data.data.posts);
        setPage(data.data.pagination?.currentPage);
        setPagination(data.data.pagination);
        setTotalPost(data.data.pagination.totalPosts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getAporovedBlogPosts(page);
  }, [page]);

  const handleNext = () => {
    if (pagination.hasNext) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (pagination.hasPrev) setPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (aToken) {
      fetchPendingPosts();
    }
  }, [aToken]);

  const handleReview = (action, post) => {
    setReviewAction(action);
    setSelectedPost(post);
    setAdminNotes("");
    setIsFeatured(false);
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedPost) return;

    setIsSubmitting(true);
    try {
      let status = "";
      switch (reviewAction) {
        case "approve":
          status = "approved";
          break;
        case "reject":
          status = "rejected";
          break;
        case "revision":
          status = "pending";
          break;
        default:
          return;
      }

      await reviewBlogPost(selectedPost._id, status, adminNotes, isFeatured);
      setReviewModal(false);
      setSelectedPost(null);
      setAdminNotes("");
      setIsFeatured(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleHidePost = async (id) => {
    try {
      const token = localStorage.getItem("aToken");
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/blog-posts/admin/post/hide/${id}`,
        {},
        {
          headers: {
            atoken: token,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        await getAporovedBlogPosts(page);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const token = localStorage.getItem("aToken");
      const response = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/blog-posts/admin/post/delete/${id}`,
        {
          headers: {
            atoken: token,
          },
        }
      );
      const data = response.data;

      if (data.success) {
        await getAporovedBlogPosts(page);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center p-4 md:p-6 bg-gray-50 rounded-lg">
        <ProgressBar progress={loadingProgress} />
        <div className="flex items-center gap-3 mt-4">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-gray-600">Loading pending posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center max-h-[92vh] h-full overflow-x-auto p-4 md:p-6 bg-gray-50 rounded-lg">
      <div className="w-full  mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Review Blog Posts
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 ${
                isActive === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }  text-sm font-medium rounded-full`}
            >
              {isActive === "pending"
                ? pendingPostsCount + " Pending posts"
                : total + " Approved posts"}
            </span>
          </div>
        </div>
        <div className=" space-y-4">
          <div className="flex gap-2 bg-white shadow-sm rounded-lg justify-start w-full items-center">
            <button
              onClick={() => setIsActive("pending")}
              className={`px-12 py-4 text-base font-semibold transition-colors hover:bg-yellow-200 ${
                isActive === "pending"
                  ? "bg-yellow-100  text-yellow-600"
                  : "text-gray-600"
              }`}
            >
              Pending
            </button>

            <button
              onClick={() => setIsActive("approved")}
              className={`px-12 py-4 text-base font-semibold  transition-colors hover:bg-green-200 ${
                isActive === "approved"
                  ? "bg-green-100 text-green-600"
                  : " text-gray-600"
              }`}
            >
              Approved
            </button>
          </div>

          {(isActive === "approved" ? approvedBlog : pendingPosts).length ===
          0 ? (
            <div className="text-center py-12">
              <FileText className="size-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Pending Posts
              </h3>
              <p className="text-gray-500">
                All blog posts have been reviewed. Check back later for new
                submissions.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {(isActive === "approved" ? approvedBlog : pendingPosts).map(
                  (post) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className=" bg-white shadow-sm rounded-lg p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Post Image */}
                        {post.imageUrl && (
                          <div className="lg:w-48 lg:flex-shrink-0">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-32 lg:h-40 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {post.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                post.status
                              )}`}
                            >
                              {post.status.charAt(0).toUpperCase() +
                                post.status.slice(1)}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {post.excerpt ||
                              post.content
                                .replace(/<[^>]*>/g, "")
                                .substring(0, 200) + "..."}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(post.submittedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText size={14} />
                              <span className="capitalize">
                                {post.category.replace("-", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-3">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => {
                                      setSelectedPost(post);
                                      setShowDetailsModal(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    <Eye size={16} />
                                    View Full Post
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="center"
                                  className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                >
                                  Read the complete blog post
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {isActive !== "approved" && (
                              <>
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <button
                                        onClick={() =>
                                          handleReview("approve", post)
                                        }
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                      >
                                        <Check size={16} />
                                        Approve
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                    >
                                      Approve and publish this post
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <button
                                        onClick={() =>
                                          handleReview("reject", post)
                                        }
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                      >
                                        <X size={16} />
                                        Reject
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                    >
                                      Reject this post
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                            {isActive !== "pending" && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => handleHidePost(post._id)}
                                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                                    >
                                      <X size={16} />
                                      {post.is_hidden ? "Unhide" : "Hide"}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    align="center"
                                    className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                  >
                                    Hide this post
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <X size={16} />
                                    Delete
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="center"
                                  className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                >
                                  Delete this post
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() =>
                                      handleReview("revision", post)
                                    }
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                  >
                                    <Edit size={16} />
                                    Request Revision
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  align="center"
                                  className="px-2.5 py-2 mb-1 rounded-[6px] border-none bg-primary text-white text-xs tracking-wide"
                                >
                                  Request changes from the author
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
              {isActive === "approved" ? (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrev}
                    disabled={!pagination.hasPrev}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
      ${
        pagination.hasPrev
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
                  >
                    Prev
                  </button>

                  {/* Page Info */}
                  <span className=" font-medium">
                    Page{" "}
                    <span className="font-bold">{pagination.currentPage}</span>{" "}
                    of{" "}
                    <span className="font-bold">{pagination.totalPages}</span>
                  </span>

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    disabled={!pagination.hasNext}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
      ${
        pagination.hasNext
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
                  >
                    Next
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <button
                    onClick={handlePendingPrev}
                    disabled={!pendingBlogPagination.hasPrev}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
      ${
        pendingBlogPagination.hasPrev
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
                  >
                    Prev
                  </button>

                  <span className=" font-medium">
                    Page{" "}
                    <span className="font-bold">
                      {pendingBlogPagination.currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold">
                      {pendingBlogPagination.totalPages}
                    </span>
                  </span>

                  <button
                    onClick={handlePendingNext} // <-- corrected here
                    disabled={!pendingBlogPagination.hasNext}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
      ${
        pendingBlogPagination.hasNext
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full Post Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPost.title}
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {selectedPost.imageUrl && (
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(selectedPost.submittedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span className="capitalize">
                      {selectedPost.category.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedPost.content,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {reviewAction === "approve" && (
                    <Check className="size-6 text-green-600" />
                  )}
                  {reviewAction === "reject" && (
                    <X className="size-6 text-red-600" />
                  )}
                  {reviewAction === "revision" && (
                    <Edit className="size-6 text-orange-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reviewAction === "approve" && "Approve Post"}
                    {reviewAction === "reject" && "Reject Post"}
                    {reviewAction === "revision" && "Request Revision"}
                  </h3>
                </div>

                <p className="text-gray-600 mb-4">
                  {reviewAction === "approve" &&
                    "This post will be published and visible to all users."}
                  {reviewAction === "reject" &&
                    "This post will be rejected and the author will be notified."}
                  {reviewAction === "revision" &&
                    "The author will be asked to make changes to this post."}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={
                      reviewAction === "approve"
                        ? "Add any notes about this post..."
                        : reviewAction === "reject"
                        ? "Reason for rejection..."
                        : "What changes are needed?"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {reviewAction === "approve" && (
                  <div className="mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Mark as Featured Post
                      </span>
                      <Star size={16} className="text-yellow-500" />
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReviewModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      reviewAction === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : reviewAction === "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-orange-600 hover:bg-orange-700"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {reviewAction === "approve" && "Approve"}
                    {reviewAction === "reject" && "Reject"}
                    {reviewAction === "revision" && "Send Revision Request"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPosts;
