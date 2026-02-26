import React, { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Loader, Mail, ArrowLeft, CheckCircle2, KeyRound, Lock, Phone, User } from "lucide-react";
import { validateToken } from "../utils/tokenUtils";
import { GoogleLogin } from "@react-oauth/google";
import { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP, getFirebaseIdToken } from "../config/firebase";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);


  const [authMode, setAuthMode] = useState("email");


  const [state, setState] = useState("Sign Up");
  const [signupStep, setSignupStep] = useState(1);
  const [forgotStep, setForgotStep] = useState(1);
  const [phoneStep, setPhoneStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);


  // Send OTP to phone
  const handleSendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    const fullPhoneNumber = countryCode + phoneNumber;
    setLoading(true);

    try {
      // Setup recaptcha on the button
      setupRecaptcha("phone-send-otp-btn");

      await sendPhoneOTP(fullPhoneNumber);
      setPhoneStep(2);
      toast.success("OTP sent to your phone!");
      setResendTimer(60);
    } catch (error) {
      console.error("Phone OTP Error:", error);
      if (error.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number format!");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify phone OTP and login
  const handleVerifyPhoneOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP!");
      return;
    }

    setLoading(true);

    try {
      await verifyPhoneOTP(otp);


      const firebaseIdToken = await getFirebaseIdToken();
      const { data } = await axios.post(backendUrl + "/api/user/phone-login", {
        firebaseIdToken,
      });

      if (data.success && validateToken(data.token)) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        if (data.isNewUser) {
          toast.success("Account created! Welcome to Raska Mon.");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP. Please try again.");
      } else if (error.code === "auth/code-expired") {
        toast.error("OTP expired. Please request a new one.");
      } else {
        toast.error(error.response?.data?.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend phone OTP
  const handleResendPhoneOTP = async () => {
    if (resendTimer > 0) return;

    const fullPhoneNumber = countryCode + phoneNumber;
    setLoading(true);

    try {
      setupRecaptcha("phone-resend-btn");
      await sendPhoneOTP(fullPhoneNumber);
      toast.success("OTP resent successfully!");
      setResendTimer(60);
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleSendOTP = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/send-otp", {
        email,
        name,
      });

      if (data.success) {
        setOtpSent(true);
        setSignupStep(2);
        toast.success("OTP sent to your email!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP!");
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await axios.post(backendUrl + "/api/user/verify-otp", {
        email,
        otp,
      });

      if (!verifyResponse.data.success) {
        toast.error(verifyResponse.data.message || "OTP verification failed");
        setLoading(false);
        return;
      }

      setOtpVerified(true);

      const { data } = await axios.post(backendUrl + "/api/user/register", {
        name,
        email,
        password,
      });

      if (data.success && validateToken(data.token)) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        toast.error("Invalid token received from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/send-otp", {
        email,
        name,
      });

      if (data.success) {
        toast.success("OTP resent successfully!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleForgotPasswordSendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/forgot-password", {
        email,
      });

      if (data.success) {
        setForgotStep(2);
        toast.success("Reset OTP sent to your email!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/verify-reset-otp", {
        email,
        otp,
      });

      if (data.success) {
        setResetToken(data.resetToken);
        setForgotStep(3);
        toast.success("OTP verified! Set your new password.");
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/forgot-password", {
        email,
      });

      if (data.success) {
        toast.success("OTP resent successfully!");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/reset-password", {
        email,
        resetToken,
        newPassword,
      });

      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        handleSwitchToLogin();
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", {
        email,
        password,
      });
      if (data.success && validateToken(data.token)) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        toast.error("Invalid token received from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/google-login", {
        idToken: credentialResponse.credential,
      });

      if (data.success && validateToken(data.token)) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        toast.error("Invalid token received from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  // Navigation handlers
  const handleSwitchToSignup = () => {
    setState("Sign Up");
    setSignupStep(1);
    setForgotStep(1);
    setPhoneStep(1);
    resetFormState();
  };

  const handleSwitchToLogin = () => {
    setState("Login");
    setSignupStep(1);
    setForgotStep(1);
    setPhoneStep(1);
    resetFormState();
  };

  const handleSwitchToForgotPassword = () => {
    setState("Forgot Password");
    setForgotStep(1);
    setOtp("");
  };

  const resetFormState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleBackToDetails = () => {
    setSignupStep(1);
    setOtpSent(false);
    setOtp("");
  };

  const handleBackToForgotEmail = () => {
    setForgotStep(1);
    setOtp("");
  };

  const handleBackToPhoneInput = () => {
    setPhoneStep(1);
    setOtp("");
  };

  useEffect(() => {
    if (token) {
      navigate("/");
      toast.success("Login successful! Welcome back.");
    }

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "login") {
      setState("Login");
    } else if (type === "signup") {
      setState("Sign Up");
    }
  }, [token]);

  return (
    <div className="motion-preset-expand">
      <div className="min-h-[60vh] flex items-center">
        <div className="flex flex-col gap-5 m-auto items-start p-8 md:p-10 w-[90vw] sm:w-[420px] border rounded-xl bg-white text-zinc-600 text-sm shadow-lg mt-10">

          {/* Auth Mode Toggle (Only for Login/Signup) */}
          {(state === "Login" || state === "Sign Up") && (
            <div className="w-full flex rounded-lg bg-purple-50 p-1">
              <button
                type="button"
                onClick={() => { setAuthMode("email"); setPhoneStep(1); setOtp(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${authMode === "email"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-purple-500 hover:text-purple-700"
                  }`}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("phone"); setSignupStep(1); setOtp(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${authMode === "phone"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-purple-500 hover:text-purple-700"
                  }`}
              >
                <Phone size={16} />
                Phone
              </button>
            </div>
          )}


          {authMode === "phone" && (state === "Login" || state === "Sign Up") && (
            <>
              {/* Header */}
              <div className="flex flex-col items-stretch gap-1 w-full text-center">
                {phoneStep === 1 ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">
                      {state === "Sign Up" ? "Sign Up with Phone" : "Login with Phone"}
                    </p>
                    <p className="text-purple-600">Enter your phone number to continue</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">Verify OTP</p>
                    <p className="text-purple-600">
                      Enter the code sent to <br />
                      <span className="font-medium text-purple-800">{countryCode}{phoneNumber}</span>
                    </p>
                  </>
                )}
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center w-full gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${phoneStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                  {phoneStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                </div>
                <div className={`flex-1 h-0.5 ${phoneStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${phoneStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                  2
                </div>
              </div>

              {/* Step 1: Phone Input */}
              {phoneStep === 1 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p>Phone Number</p>
                      <div className="flex gap-2 mt-1">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="border border-purple-200 rounded-lg p-3 bg-white text-purple-900 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+65">🇸🇬 +65</option>
                        </select>
                        <input
                          className="flex-1 border border-purple-200 rounded-lg font-normal text-purple-900 p-3 focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all"
                          type="tel"
                          inputMode="numeric"
                          placeholder="Enter phone number"
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          value={phoneNumber}
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full items-stretch text-center mt-4">
                    <button
                      id="phone-send-otp-btn"
                      type="button"
                      onClick={handleSendPhoneOTP}
                      className={`flex items-center justify-center gap-4 bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg text-base font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"
                        }`}
                      disabled={loading}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Send OTP</span>}
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div className="flex w-full items-center justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        disabled={loading}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width="100%"
                      />
                    </div>

                    <p className="text-purple-600">
                      {state === "Sign Up" ? "Already have an Account?" : "Don't have an Account?"} &nbsp;
                      <span
                        onClick={state === "Sign Up" ? handleSwitchToLogin : handleSwitchToSignup}
                        className="text-purple-800 font-medium hover:underline cursor-pointer"
                      >
                        {state === "Sign Up" ? "Login Here" : "Sign Up"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {phoneStep === 2 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p className="text-center mb-2">Enter Verification Code</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 tracking-[0.5em] w-full p-4 text-center text-xl focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="------"
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        value={otp}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-6">
                    <button
                      type="button"
                      onClick={handleVerifyPhoneOTP}
                      className={`flex items-center justify-center gap-4 bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg text-base font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"
                        }`}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Verify & Continue</span>}
                    </button>

                    <p className="text-purple-600 text-sm">
                      Didn't receive the code?{" "}
                      {resendTimer > 0 ? (
                        <span className="text-gray-500">Resend in {resendTimer}s</span>
                      ) : (
                        <span
                          id="phone-resend-btn"
                          onClick={handleResendPhoneOTP}
                          className="text-purple-800 font-medium hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </span>
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={handleBackToPhoneInput}
                      className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800"
                    >
                      <ArrowLeft size={16} />
                      <span>Change phone number</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


          {state === "Forgot Password" && (
            <>
              <div className="flex flex-col items-stretch gap-1 w-full text-center">
                {forgotStep === 1 && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">Forgot Password?</p>
                    <p className="text-purple-600">Enter your email to reset your password</p>
                  </>
                )}
                {forgotStep === 2 && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">Verify Your Email</p>
                    <p className="text-purple-600">
                      We've sent a code to <span className="font-medium text-purple-800">{email}</span>
                    </p>
                  </>
                )}
                {forgotStep === 3 && (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">Create New Password</p>
                    <p className="text-purple-600">Enter your new password below</p>
                  </>
                )}
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center w-full gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${forgotStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                  {forgotStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                </div>
                <div className={`flex-1 h-0.5 ${forgotStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${forgotStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                  {forgotStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                </div>
                <div className={`flex-1 h-0.5 ${forgotStep >= 3 ? "bg-purple-600" : "bg-gray-200"}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${forgotStep >= 3 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                  3
                </div>
              </div>

              {/* Forgot Password Steps */}
              {forgotStep === 1 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p>Email Id</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="Enter your registered email"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-4">
                    <button
                      type="button"
                      onClick={handleForgotPasswordSendOTP}
                      className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                      disabled={loading}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Send Reset Code</span>}
                    </button>

                    <button type="button" onClick={handleSwitchToLogin} className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800">
                      <ArrowLeft size={16} />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </div>
              )}

              {forgotStep === 2 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p className="text-center mb-2">Enter Verification Code</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 tracking-[0.5em] w-full p-4 text-center text-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="------"
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        value={otp}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-6">
                    <button
                      type="button"
                      onClick={handleVerifyResetOTP}
                      className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Verify Code</span>}
                    </button>

                    <p className="text-purple-600 text-sm">
                      Didn't receive the code?{" "}
                      {resendTimer > 0 ? <span className="text-gray-500">Resend in {resendTimer}s</span> : (
                        <span onClick={handleResendResetOTP} className="text-purple-800 font-medium hover:underline cursor-pointer">Resend OTP</span>
                      )}
                    </p>

                    <button type="button" onClick={handleBackToForgotEmail} className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800">
                      <ArrowLeft size={16} />
                      <span>Change email</span>
                    </button>
                  </div>
                </div>
              )}

              {forgotStep === 3 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p>New Password</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        type="password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        value={newPassword}
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                    <div className="w-full">
                      <p>Confirm Password</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        type="password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-4">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                      disabled={loading}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Reset Password</span>}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


          {authMode === "email" && state === "Login" && (
            <>
              <div className="flex flex-col items-stretch gap-1 w-full text-center">
                <p className="text-2xl font-semibold text-purple-800">Welcome Back</p>
                <p className="text-purple-600">Log in to get started.</p>
              </div>

              <form onSubmit={onSubmitHandler} className="w-full">
                <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                  <div className="w-full">
                    <p>Email Id</p>
                    <input
                      className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <p>Your Password</p>
                    <input
                      className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      required
                    />
                  </div>
                </div>

                <div className="w-full text-right mt-2">
                  <span onClick={handleSwitchToForgotPassword} className="text-purple-600 text-sm hover:text-purple-800 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>

                <div className="flex flex-col gap-4 w-full text-center mt-4">
                  <button
                    type="submit"
                    className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                    disabled={loading}
                  >
                    {loading ? <Loader size={25} className="animate-spin" /> : <span>Log In</span>}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  <div className="flex w-full items-center justify-center">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading} theme="outline" size="large" text="continue_with" shape="rectangular" width="100%" />
                  </div>

                  <p className="text-purple-600">
                    Don't have an Account? &nbsp;
                    <span onClick={handleSwitchToSignup} className="text-purple-800 font-medium hover:underline cursor-pointer">Sign Up</span>
                  </p>
                </div>
              </form>
            </>
          )}


          {authMode === "email" && state === "Sign Up" && (
            <>
              <div className="flex flex-col items-stretch gap-1 w-full text-center">
                {signupStep === 2 ? (
                  <>
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-800">Verify Your Email</p>
                    <p className="text-purple-600">
                      Enter the code sent to <span className="font-medium text-purple-800">{email}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold text-purple-800">Create Account</p>
                    <p className="text-purple-600">Sign up to book an appointment.</p>
                  </>
                )}
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center w-full gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${signupStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                  {signupStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                </div>
                <div className={`flex-1 h-0.5 ${signupStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${signupStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-200"}`}>
                  2
                </div>
              </div>

              {signupStep === 1 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p>Name</p>
                      <input className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none" type="text" onChange={(e) => setName(e.target.value)} value={name} required />
                    </div>
                    <div className="w-full">
                      <p>Email Id</p>
                      <input className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none" type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>
                    <div className="w-full">
                      <p>Create Password</p>
                      <input className="border border-purple-200 rounded-lg font-normal text-purple-900 w-full p-3 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none" type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-4">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                      disabled={loading}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Continue</span>}
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div className="flex w-full items-center justify-center">
                      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading} theme="outline" size="large" text="continue_with" shape="rectangular" width="100%" />
                    </div>

                    <p className="text-purple-600">
                      Already have an Account? &nbsp;
                      <span onClick={handleSwitchToLogin} className="text-purple-800 font-medium hover:underline cursor-pointer">Login Here</span>
                    </p>
                  </div>
                </div>
              )}

              {signupStep === 2 && (
                <div className="w-full">
                  <div className="flex flex-col gap-4 w-full font-medium text-purple-700">
                    <div className="w-full">
                      <p className="text-center mb-2">Enter Verification Code</p>
                      <input
                        className="border border-purple-200 rounded-lg font-normal text-purple-900 tracking-[0.5em] w-full p-4 text-center text-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="------"
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        value={otp}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-center mt-6">
                    <button
                      type="button"
                      onClick={handleVerifyAndRegister}
                      className={`flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white w-full h-12 rounded-lg font-medium ${loading ? "cursor-not-allowed opacity-80" : "hover:shadow-md active:scale-[98%] transition-all"}`}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? <Loader size={25} className="animate-spin" /> : <span>Verify & Create Account</span>}
                    </button>

                    <p className="text-purple-600 text-sm">
                      Didn't receive the code?{" "}
                      {resendTimer > 0 ? <span className="text-gray-500">Resend in {resendTimer}s</span> : (
                        <span onClick={handleResendOTP} className="text-purple-800 font-medium hover:underline cursor-pointer">Resend OTP</span>
                      )}
                    </p>

                    <button type="button" onClick={handleBackToDetails} className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800">
                      <ArrowLeft size={16} />
                      <span>Back to details</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


          <div id="recaptcha-container" ref={recaptchaRef}></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
