import axios from "axios";
import { createContext, useState, useEffect, useContext } from "react"; // Added useContext here
import { toast } from "react-toastify";

export const AdminContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AdminProvider");
  }
  return context;
};

const AdminContextProvider = (props) => {
  const [aToken, setAtoken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );

  // Remove trailing slash to prevent double slashes in API URLs
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const backendUrl = rawBackendUrl.endsWith("/") 
    ? rawBackendUrl.slice(0, -1) 
    : rawBackendUrl;

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const limit = 9;
  const [pendingBlogPage, setPendingBlogPage] = useState(1);
  const [pendingBlogPagination, setPendingBlogPagination] = useState({});
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Blog post management functions
  const getPendingBlogPosts = async (pendingBlogPage) => {
    try {
      const { data } = await axios.get(
        backendUrl +
          `/api/blog-posts/admin/pending?page=${pendingBlogPage}&limit=${limit}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setPendingPosts(data.data.posts);
        setPendingBlogPage(data.data.pagination?.currentPage);
        setPendingBlogPagination(data.data.pagination);
        setPendingPostsCount(data.data.pagination.totalPosts);
        console.log(data, "pending");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getPendingBlogPosts(pendingBlogPage);
  }, [pendingBlogPage]);
  const handlePendingNext = () => {
    if (pendingBlogPagination.hasNext) setPendingBlogPage((prev) => prev + 1);
  };

  const handlePendingPrev = () => {
    if (pendingBlogPagination.hasPrev) setPendingBlogPage((prev) => prev - 1);
  };

  const reviewBlogPost = async (
    postId,
    status,
    adminNotes,
    isFeatured = false
  ) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/api/blog-posts/admin/${postId}/review`,
        { status, adminNotes, isFeatured },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getPendingBlogPosts(pendingBlogPage); // Refresh the list
        getDashData(); // Update dashboard data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAtoken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    pendingPosts,
    pendingPostsCount,
    getPendingBlogPosts,
    pendingBlogPage,
    pendingBlogPagination,
    handlePendingNext,
    handlePendingPrev,
    reviewBlogPost,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
