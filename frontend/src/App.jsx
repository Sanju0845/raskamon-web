import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // Added useLocation
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";

import Footer from "./components/Footer";
import ScrollToTopFloatingButton from "./components/ScrollToTopFloatingButton";
import { ToastContainer } from "react-toastify";
import WelcomeLoader from "./components/WelcomeLoader";

import Services from "./pages/Services";
import OurTeam from "./pages/Team";
import MoodTracker from "../MoodAnalyzer/moodtracker";
import MoodAnalysis from "./pages/MoodAnalysis";
import MoodDashboard from "./pages/MoodDashboard";
import MoodTest from "./components/MoodAnalysis/MoodTest";
// Removed legacy assessment-specific components in favor of unified Assessments grid
import Result from "./pages/Result";

import Resources from "./pages/Resources";
// import Couples from "./components/Assessment/Couples";

import Assessments from "./pages/Assessments";
import Assessment from "./pages/Assessment";
import MyAssessments from "./pages/MyAssessments";
import AssessmentDetailedResults from "./components/AssessmentDetailedResults";
import CancellationPolicy from "./pages/CancellationPolicy";
import BlogPost from "./pages/BlogPost";
import WriteBlog from "./pages/WriteBlog";
import AIMoodTracker from "./pages/AIMoodTracker";
import Notifications from "./pages/Notifications";
import UserDashboard from "./components/UserDashboard/UserDashboard";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import TermsConditionsPage from "./pages/Terms&ConditionsPage";

import { ChatButton } from "./components/ChatbotComponents/ChatButton";
import { ChatModal } from "./components/ChatbotComponents/ChatModal";
import { useAuth, AppContext } from "./context/AppContext";

import IndividualTherapy from "./pages/IndividualTherapy";
import ChildAdolescentTherapy from "./pages/ChildAdolescentTherapy";
import FamilyTherapy from "./pages/FamilyTherapy";
import CouplesCounselling from "./pages/CouplesCounselling";
import MoodAndTracker from "./components/MoodTracker/MoodTracker";
import { useContext } from "react";
import axios from "axios";
import Pricing from "./pages/Pricing";
// Lazy load components
const Doctors = lazy(() => import("./pages/Doctors"));
const LiveChat = lazy(() => import("./pages/LiveChat"));

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [showLoader, setShowLoader] = useState(true);
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { token } = useAuth();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const loaderComponent = (
    <div
      id="welcome-loader"
      className="fixed inset-0 z-50 transition-opacity duration-500 ease-in-out pointer-events-none"
      style={{
        opacity: showLoader ? 1 : 0,
        backgroundColor: "white",
      }}
    >
      <WelcomeLoader />
    </div>
  );

  const { userData } = useContext(AppContext);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/list`,
      );
      if (data.success) {
        localStorage.setItem("doctors", JSON.stringify(data.doctors));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch and store user's assessments
  const fetchUserAssessments = async () => {
    if (!userData || !token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/assessments/user/${
          userData._id
        }`,
        {
          headers: { token },
        },
      );
      const data = await response.json();
      localStorage.setItem("userAssessments", JSON.stringify(data));
      console.log("✅ User assessments stored in localStorage");
    } catch (error) {
      console.error("Error fetching user assessments:", error);
    }
  };

  useEffect(() => {
    // Show loader for 5 seconds
    setTimeout(() => {
      setShowLoader(false);
    }, 5000);
  }, []);

  // Always fetch assessments and doctors on every page load (but not on chat page to prevent re-renders)
  useEffect(() => {
    getDoctorsData();
    if (token && userData?._id) {
      fetchUserAssessments();
    }
  }, [token, userData?._id]); // Removed location.pathname to prevent re-renders on chat page

  return (
    <>
      {showLoader && loaderComponent}
      <div>
        <ToastContainer
          theme="light"
          className="scale-95  sm:scale-100 sm:mt-16"
        />
        <Navbar />
        <ScrollToTop /> {/* Add this component */}
        {location.pathname !== "/" && <ScrollToTopFloatingButton />}
        <Suspense fallback={loaderComponent}>
          <Routes>
            <Route path="/upgrade" element={<Pricing />} />
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:speciality" element={<Doctors />} />
            <Route path="/live-chat/:doctorId" element={<LiveChat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ourTeam" element={<OurTeam />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/moodtracker" element={<MoodAndTracker />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/refund-policy" element={<RefundPage />} />
            <Route path="/terms&conditions" element={<TermsConditionsPage />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/appointment/:docId" element={<Appointment />} />
            <Route
              path="/cancellation-policy"
              element={<CancellationPolicy />}
            />
            {/* Services Routes */}
            <Route
              path="/CouplesCounselling"
              element={<CouplesCounselling />}
            />
            <Route path="/family-therapy" element={<FamilyTherapy />} />
            <Route
              path="/child-adolescent"
              element={<ChildAdolescentTherapy />}
            />
            <Route path="/individual-therapy" element={<IndividualTherapy />} />

            {/* Assessment routes */}
            <Route path="/individual" element={<Assessments />} />
            <Route path="/couples" element={<Assessments />} />
            <Route path="/family" element={<Assessments />} />
            <Route path="/child" element={<Assessments />} />
            <Route path="/assessment/:id/:therapy" element={<Assessment />} />
            <Route path="/my-assessments" element={<MyAssessments />} />
            <Route
              path="/assessment-results/:id"
              element={<AssessmentDetailedResults />}
            />

            {/* Assessment routes */}
            <Route path="/mood-analysis" element={<MoodAnalysis />} />
            {/* <Route path="/moodtracker" element={<MoodTracker />} /> */}
            <Route path="/mood-dashboard" element={<MoodDashboard />} />
            <Route path="/moodtest" element={<MoodTest />} />
            {/* Unified assessments handle these routes above */}

            {/* MOOD ANALYZER routes */}

            <Route path="/ai-moodtracker" element={<AIMoodTracker />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/result" element={<Result />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/write-blog" element={<WriteBlog />} />
          </Routes>
        </Suspense>
        {/* Chatbot - Show for all users */}
        <>
          <ChatButton isOpen={isChatOpen} onClick={toggleChat} />
          <ChatModal isOpen={isChatOpen} onClose={toggleChat} />
        </>
        <Footer />
      </div>
    </>
  );
};

export default App;
