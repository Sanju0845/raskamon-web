import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import tempReservationModel from "../models/tempReservationModel.js";
import razorpay from "razorpay";
import { OAuth2Client } from "google-auth-library";
import {
  parseAppointmentDate,
  generateGoogleMeetLink,
} from "../services/generateMeetLink.js";
import { sendAppointmentConfirmationEmail, sendOTPEmail, sendPasswordResetEmail } from "../services/emailService.js";
import { verifyFirebaseToken } from "../services/firebaseAdmin.js";


const otpStore = new Map();
const passwordResetStore = new Map();

const uploadReport = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!req.file)
      return res
        .status(404)
        .json({ success: false, message: "No file uploaded" });

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    const newReport = {
      filename: req.file.originalname,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    appointmentId.uploadedReports.push(newReport);
    await appointmentId.save();

    res.json({
      success: true,
      message: "File uploaded successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// api to register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details..." });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered! Login instead.",
      });
    }

    //   validating email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a Valid Email !!" });
    }

    //   validating strong password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be Strong!",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Registration failed! Try again.",
    });
  }
};

// api to login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details..." });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a Valid Email." });
    }

    // find user by email in database
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Account not found! Try Again.",
      });
    }

    // compare user password with saved password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Credentials! Try again.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Login failed! Try again.",
    });
  }
};

// api to login with Google OAuth
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: "Google token is required" });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    // Check if user already exists
    let user = await userModel.findOne({ googleId });

    if (!user) {
      // Check if user exists with email but not Google OAuth
      user = await userModel.findOne({ email });

      if (user) {
        // Update existing user to include Google OAuth info
        user.googleId = googleId;
        user.isGoogleUser = true;
        user.emailVerified = email_verified;
        if (picture) user.image = picture;
        await user.save();
      } else {
        // Create new user
        user = new userModel({
          name,
          email,
          googleId,
          isGoogleUser: true,
          emailVerified: email_verified,
          image: picture || "",
        });
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Google login failed! Try again.",
    });
  }
};

// api to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await userModel.findById(userId).select("-password");
    res.status(201).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Api to update User profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details..." });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.status(201).json({ success: true, message: "Profile Updated 🎉" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to book appointment

const bookAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      docId,
      slotDate,
      slotTime,
      reasonForVisit,
      sessionType,
      communicationMethod,
      briefNotes,
      emergencyContact,
      consentGiven,
      chatSummary,
    } = req.body;

    /* ---------------------- VALIDATION ---------------------- */
    if (!reasonForVisit || !sessionType || !consentGiven) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields!",
      });
    }

    if (sessionType === "Online" && !communicationMethod) {
      return res.status(400).json({
        success: false,
        message: "Please select a communication method for online sessions!",
      });
    }

    /* ---------------------- DOCTOR VALIDATION ---------------------- */
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not available!" });
    }

    const slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res
        .status(400)
        .json({ success: false, message: "Slot not available!" });
    }

    const existingTempReservation = await tempReservationModel.findOne({
      docId,
      slotDate,
      slotTime,
      expiresAt: { $gt: new Date() },
    });

    if (existingTempReservation) {
      return res.status(400).json({
        success: false,
        message:
          "Slot is being processed by another user. Please try again shortly.",
      });
    }

    const existingAppointment = await appointmentModel.findOne({
      docId,
      slotDate,
      slotTime,
      payment: true,
      cancelled: false,
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked!" });
    }

    /* ---------------------- USER DETAILS ---------------------- */
    const userData = await userModel.findById(userId).select("-password");

    /* ---------------------- FILE HANDLING ---------------------- */
    let uploadedReports = [];

    if (req.files && req.files.length > 0) {
      // Multiple file uploads
      uploadedReports = req.files.map((file) => ({
        filename: file.originalname || file.filename,
        fileUrl: file.path || `/uploads/reports/${file.filename}`, // ✅ supports Cloudinary or local
        fileType: file.mimetype,
      }));
    } else if (req.file) {
      // Single file upload
      uploadedReports.push({
        filename: req.file.originalname || req.file.filename,
        fileUrl: req.file.path || `/uploads/reports/${req.file.filename}`,
        fileType: req.file.mimetype,
      });
    }

    /* ---------------------- RESERVATION CREATION ---------------------- */
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    const newTempReservation = new tempReservationModel({
      userId,
      docId,
      userData: userData.toObject ? userData.toObject() : userData,
      docData: docData.toObject ? docData.toObject() : docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      reasonForVisit,
      sessionType,
      communicationMethod,
      briefNotes,
      emergencyContact,
      consentGiven,
      expiresAt,
      chatSummary,
      uploadedReports,
    });

    await newTempReservation.save();

    /* ---------------------- RESPONSE ---------------------- */
    res.status(201).json({
      success: true,
      message: "Slot reserved! Please complete payment to confirm booking.",
      tempReservationId: newTempReservation._id,
      uploadedReports,
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while booking the appointment.",
      error: error.message,
    });
  }
};

// API to book appointment using credits
const bookAppointmentCredits = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      docId,
      slotDate,
      slotTime,
      reasonForVisit,
      sessionType,
      communicationMethod,
      briefNotes,
      emergencyContact,
      consentGiven,
    } = req.body;

    /* ---------------------- VALIDATION ---------------------- */
    if (!reasonForVisit || !sessionType || !consentGiven) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields!",
      });
    }

    if (sessionType === "Online" && !communicationMethod) {
      return res.status(400).json({
        success: false,
        message: "Please select a communication method for online sessions!",
      });
    }

    /* ---------------------- DOCTOR VALIDATION ---------------------- */
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not available!" });
    }

    const slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res
        .status(400)
        .json({ success: false, message: "Slot not available!" });
    }

    const existingAppointment = await appointmentModel.findOne({
      docId,
      slotDate,
      slotTime,
      payment: true,
      cancelled: false,
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked!" });
    }

    /* ---------------------- USER & CREDITS VALIDATION ---------------------- */
    const userData = await userModel.findById(userId).select("-password");
    
    if (!userData.credits || userData.credits < docData.fees) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You have ${userData.credits || 0} credits but need ${docData.fees} credits.`,
      });
    }

    /* ---------------------- FILE HANDLING ---------------------- */
    let uploadedReports = [];

    if (req.files && req.files.length > 0) {
      uploadedReports = req.files.map((file) => ({
        filename: file.originalname || file.filename,
        fileUrl: file.path || `/uploads/reports/${file.filename}`,
        fileType: file.mimetype,
      }));
    } else if (req.file) {
      uploadedReports.push({
        filename: req.file.originalname || req.file.filename,
        fileUrl: req.file.path || `/uploads/reports/${req.file.filename}`,
        fileType: req.file.mimetype,
      });
    }

    /* ---------------------- CREATE APPOINTMENT ---------------------- */
    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData: userData.toObject ? userData.toObject() : userData,
      docData: docData.toObject ? docData.toObject() : docData,
      amount: docData.fees,
      date: Date.now(),
      payment: true,
      paymentMode: "credits",
      paymentId: `credit_${Date.now()}`,
      reasonForVisit,
      sessionType,
      communicationMethod,
      briefNotes,
      emergencyContact: emergencyContact ? JSON.parse(emergencyContact) : {},
      consentGiven: consentGiven === "true" || consentGiven === true,
      uploadedReports,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    /* ---------------------- DEDUCT CREDITS ---------------------- */
    await userModel.findByIdAndUpdate(userId, {
      $inc: { credits: -docData.fees },
    });

    /* ---------------------- UPDATE DOCTOR SLOTS ---------------------- */
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    /* ---------------------- RESPONSE ---------------------- */
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully using credits!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Book Appointment Credits Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while booking the appointment.",
      error: error.message,
    });
  }
};

// Api to get user Appointments for frontend my appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel.find({ userId });
    res.status(201).json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api to Cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized Action!" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.status(201).json({ success: true, message: "Appointment Cancelled!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- RAZORPAY PAYMENT GATEWAY - INTEGRATION -----------

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Api to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { tempReservationId } = req.body;
    const tempReservation = await tempReservationModel.findById(
      tempReservationId
    );

    if (!tempReservation) {
      return res.status(400).json({
        success: false,
        message: "Reservation not found!",
      });
    }

    // Check if reservation has expired
    if (tempReservation.expiresAt < new Date()) {
      // Clean up expired reservation
      await tempReservationModel.findByIdAndDelete(tempReservationId);
      return res.status(400).json({
        success: false,
        message: "Reservation has expired. Please try booking again.",
      });
    }

    // Check if user owns this reservation
    if (tempReservation.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access to reservation!",
      });
    }

    // Check if slot is still available
    const docData = await doctorModel.findById(tempReservation.docId);
    let slots_booked = docData.slots_booked;

    if (slots_booked[tempReservation.slotDate]) {
      if (
        slots_booked[tempReservation.slotDate].includes(
          tempReservation.slotTime
        )
      ) {
        // Slot is now booked, clean up reservation
        await tempReservationModel.findByIdAndDelete(tempReservationId);
        return res.status(400).json({
          success: false,
          message: "Slot is no longer available. Please select another time.",
        });
      }
    }

    // creating options for razorpay payment
    const options = {
      amount: tempReservation.amount * 100,
      currency: process.env.CURRENCY,
      receipt: tempReservationId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    // Update reservation with order ID
    await tempReservationModel.findByIdAndUpdate(tempReservationId, {
      razorpayOrderId: order.id,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api to verify payment of razorpay
// const verifyRazorpay = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id } = req.body;
//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

//     if (orderInfo.status === "paid") {
//       const tempReservationId = orderInfo.receipt;

//       // Get the temporary reservation
//       const tempReservation = await tempReservationModel.findById(
//         tempReservationId
//       );

//       if (!tempReservation) {
//         return res.status(404).json({
//           success: false,
//           message: "Reservation not found!",
//         });
//       }

//       // Check if reservation has expired
//       if (tempReservation.expiresAt < new Date()) {
//         await tempReservationModel.findByIdAndDelete(tempReservationId);
//         return res.status(400).json({
//           success: false,
//           message: "Reservation has expired. Please try booking again.",
//         });
//       }

//       // Check if slot is still available
//       const docData = await doctorModel.findById(tempReservation.docId);
//       let slots_booked = docData.slots_booked || {};

//       if (slots_booked[tempReservation.slotDate]) {
//         if (
//           slots_booked[tempReservation.slotDate].includes(
//             tempReservation.slotTime
//           )
//         ) {
//           // Slot is now booked, clean up reservation
//           await tempReservationModel.findByIdAndDelete(tempReservationId);
//           return res.status(400).json({
//             success: false,
//             message: "Slot is no longer available. Please select another time.",
//           });
//         }
//       }

//       // Create the actual appointment
//       const appointmentData = {
//         userId: tempReservation.userId,
//         docId: tempReservation.docId,
//         userData: tempReservation.userData,
//         docData: tempReservation.docData,
//         amount: tempReservation.amount,
//         slotTime: tempReservation.slotTime,
//         slotDate: tempReservation.slotDate,
//         date: Date.now(),
//         reasonForVisit: tempReservation.reasonForVisit,
//         sessionType: tempReservation.sessionType,
//         communicationMethod: tempReservation.communicationMethod,
//         briefNotes: tempReservation.briefNotes,
//         emergencyContact: tempReservation.emergencyContact,
//         consentGiven: tempReservation.consentGiven,
//         chatSummary: tempReservation.chatSummary,
//         payment: true,
//         razorpayOrderId: razorpay_order_id,
//         razorpayPaymentId: razorpay_payment_id,
//       };

//       const newAppointment = new appointmentModel(appointmentData);
//       await newAppointment.save();

//       // Mark the slot as booked in doctor's data
//       if (slots_booked[tempReservation.slotDate]) {
//         if (
//           !slots_booked[tempReservation.slotDate].includes(
//             tempReservation.slotTime
//           )
//         ) {
//           slots_booked[tempReservation.slotDate].push(tempReservation.slotTime);
//         }
//       } else {
//         slots_booked[tempReservation.slotDate] = [tempReservation.slotTime];
//       }

//       await doctorModel.findByIdAndUpdate(tempReservation.docId, {
//         slots_booked,
//       });

//       // Delete the temporary reservation
//       await tempReservationModel.findByIdAndDelete(tempReservationId);

//       res.status(201).json({
//         success: true,
//         message: "Payment Successful! Your appointment is confirmed. 🎉",
//         appointmentId: newAppointment._id,
//       });
//     } else {
//       res.status(401).json({ success: false, message: "Payment Failed..." });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const verifyRazorpay = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id } = req.body;

//     // Fetch Razorpay order info
//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
//     if (orderInfo.status !== "paid") {
//       return res
//         .status(401)
//         .json({ success: false, message: "Payment Failed" });
//     }

//     const tempReservationId = orderInfo.receipt;
//     const tempReservation = await tempReservationModel.findById(
//       tempReservationId
//     );
//     if (!tempReservation)
//       return res
//         .status(404)
//         .json({ success: false, message: "Reservation not found" });

//     // Check reservation expiration
//     if (tempReservation.expiresAt < new Date()) {
//       await tempReservationModel.findByIdAndDelete(tempReservationId);
//       return res.status(410).json({
//         success: false,
//         message: "Reservation expired. Try booking again.",
//       });
//     }

//     // Check slot availability
//     const docData = await doctorModel.findById(tempReservation.docId);
//     let slots_booked = docData.slots_booked || {};
//     if (
//       slots_booked[tempReservation.slotDate]?.includes(tempReservation.slotTime)
//     ) {
//       await tempReservationModel.findByIdAndDelete(tempReservationId);
//       return res
//         .status(409)
//         .json({ success: false, message: "Slot no longer available" });
//     }

//     // Prepare appointment data
//     const appointmentData = {
//       userId: tempReservation.userId,
//       docId: tempReservation.docId,
//       userData: tempReservation.userData,
//       docData: tempReservation.docData,
//       amount: tempReservation.amount,
//       slotTime: tempReservation.slotTime,
//       slotDate: tempReservation.slotDate,
//       date: Date.now(),
//       reasonForVisit: tempReservation.reasonForVisit,
//       sessionType: tempReservation.sessionType,
//       communicationMethod: tempReservation.communicationMethod,
//       briefNotes: tempReservation.briefNotes,
//       emergencyContact: tempReservation.emergencyContact,
//       consentGiven: tempReservation.consentGiven,
//       payment: true,
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//     };

//     // Create appointment first to get an _id
//     const newAppointment = await appointmentModel.create(appointmentData);

//     // Generate Meeting link for online sessions (Google Meet/Zoom)
//     if (newAppointment.sessionType === "Online") {
//       try {
//         const meetLink = await generateGoogleMeetLink(newAppointment);
//         if (meetLink) {
//           newAppointment.meetingLink = meetLink;
//           await newAppointment.save();
//         }
//       } catch (err) {
//         console.error(
//           `Meeting link generation error for appointment ${newAppointment._id}:`,
//           err.message
//         );
//       }
//     }

//     // Mark slot as booked
//     if (!slots_booked[tempReservation.slotDate])
//       slots_booked[tempReservation.slotDate] = [];
//     if (
//       !slots_booked[tempReservation.slotDate].includes(tempReservation.slotTime)
//     ) {
//       slots_booked[tempReservation.slotDate].push(tempReservation.slotTime);
//     }
//     await doctorModel.findByIdAndUpdate(tempReservation.docId, {
//       slots_booked,
//     });

//     // Delete temporary reservation
//     await tempReservationModel.findByIdAndDelete(tempReservationId);

//     // Send confirmation emails
//     sendAppointmentConfirmationEmail(newAppointment);

//     res.status(201).json({
//       success: true,
//       message: "Payment successful! Appointment confirmed.",
//       appointmentId: newAppointment._id,
//       meetingLink: newAppointment.meetingLink || null,
//     });
//   } catch (error) {
//     console.error("verifyRazorpay error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    // 1️⃣ Fetch Razorpay order
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status !== "paid") {
      return res
        .status(401)
        .json({ success: false, message: "Payment Failed" });
    }

    // 2️⃣ Get temporary reservation
    const tempReservationId = orderInfo.receipt;
    const tempReservation = await tempReservationModel.findById(
      tempReservationId
    );
    if (!tempReservation)
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });

    // 3️⃣ Check expiration
    if (tempReservation.expiresAt < new Date()) {
      await tempReservationModel.findByIdAndDelete(tempReservationId);
      return res
        .status(410)
        .json({ success: false, message: "Reservation expired" });
    }

    // 4️⃣ Check slot availability
    const docData = await doctorModel.findById(tempReservation.docId);
    let slots_booked = docData.slots_booked || {};
    if (
      slots_booked[tempReservation.slotDate]?.includes(tempReservation.slotTime)
    ) {
      await tempReservationModel.findByIdAndDelete(tempReservationId);
      return res
        .status(409)
        .json({ success: false, message: "Slot no longer available" });
    }

    // 5️⃣ Prepare appointment data
    const appointmentData = {
      userId: tempReservation.userId,
      docId: tempReservation.docId,
      userData: tempReservation.userData,
      docData: tempReservation.docData,
      amount: tempReservation.amount,
      slotTime: tempReservation.slotTime,
      slotDate: tempReservation.slotDate,
      date: Date.now(),
      reasonForVisit: tempReservation.reasonForVisit,
      sessionType: tempReservation.sessionType,
      communicationMethod: tempReservation.communicationMethod,
      briefNotes: tempReservation.briefNotes,
      emergencyContact: tempReservation.emergencyContact,
      uploadedReports: tempReservation.uploadedReports || [],
      consentGiven: tempReservation.consentGiven,
      payment: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    };

    // 6️⃣ Create appointment
    const newAppointment = await appointmentModel.create(appointmentData);

    // 7️⃣ Generate Google Meet link (doctor-hosted or admin fallback)
    if (newAppointment.sessionType === "Online") {
      try {
        const meetLink = await generateGoogleMeetLink(newAppointment);
        if (meetLink) {
          newAppointment.meetingLink = meetLink;
          await newAppointment.save(); // MUST save before sending email
        }
      } catch (err) {
        console.error(
          `Error generating Meet link for appointment ${newAppointment._id}:`,
          err.message
        );
      }
    }

    // 8️⃣ Mark slot as booked
    if (!slots_booked[tempReservation.slotDate])
      slots_booked[tempReservation.slotDate] = [];
    if (
      !slots_booked[tempReservation.slotDate].includes(tempReservation.slotTime)
    ) {
      slots_booked[tempReservation.slotDate].push(tempReservation.slotTime);
    }
    await doctorModel.findByIdAndUpdate(tempReservation.docId, {
      slots_booked,
    });

    // 9️⃣ Delete temp reservation
    await tempReservationModel.findByIdAndDelete(tempReservationId);

    // 🔹 Send confirmation emails AFTER Meet link is saved
    await sendAppointmentConfirmationEmail(newAppointment);

    // 10️⃣ Respond to frontend
    res.status(201).json({
      success: true,
      message:
        "Payment successful! Appointment confirmed. Meeting link sent via email.",
      appointmentId: newAppointment._id,
      meetingLink: newAppointment.meetingLink || null,
    });
  } catch (error) {
    console.error("verifyRazorpay error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to handle payment cancellation and cleanup
const cancelPayment = async (req, res) => {
  try {
    const { tempReservationId } = req.body;
    const tempReservation = await tempReservationModel.findById(
      tempReservationId
    );

    if (!tempReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found!",
      });
    }

    // Check if user owns this reservation
    if (tempReservation.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access to reservation!",
      });
    }

    // Delete the temporary reservation
    await tempReservationModel.findByIdAndDelete(tempReservationId);

    res.status(200).json({
      success: true,
      message: "Payment cancelled. Slot is now available for booking.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to cleanup expired temporary reservations
const cleanupExpiredReservations = async () => {
  try {
    const now = new Date();

    // Find and delete expired temporary reservations
    const expiredReservations = await tempReservationModel.find({
      expiresAt: { $lt: now },
    });

    for (const reservation of expiredReservations) {
      await tempReservationModel.findByIdAndDelete(reservation._id);
      console.log(`Cleaned up expired reservation: ${reservation._id}`);
    }

    console.log(
      `Cleaned up ${expiredReservations.length} expired reservations`
    );
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
  }
};

// Api to get real-time slot availability for a doctor
const getSlotAvailability = async (req, res) => {
  try {
    const { docId, slotDate } = req.params;

    // Get doctor's booked slots
    const doctorData = await doctorModel.findById(docId);
    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found!",
      });
    }

    const bookedSlots = doctorData.slots_booked?.[slotDate] || [];

    // Get active temporary reservations for this date
    const now = new Date();
    const activeReservations = await tempReservationModel.find({
      docId,
      slotDate,
      expiresAt: { $gt: now },
    });

    const reservedSlots = activeReservations.map(
      (reservation) => reservation.slotTime
    );

    // Combine booked and reserved slots
    const unavailableSlots = [...new Set([...bookedSlots, ...reservedSlots])];

    res.status(200).json({
      success: true,
      unavailableSlots,
      bookedSlots,
      reservedSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredReservations, 5 * 60 * 1000);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a Valid Email!" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered! Login instead.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry


    otpStore.set(email, { otp, expiresAt, name });


    await sendOTPEmail(email, otp, name || "User");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully! Please check your email.",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - delete from store
    otpStore.delete(email);

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a Valid Email!" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Check if user is a Google user without password
    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP for password reset
    passwordResetStore.set(email, { otp, expiresAt, userId: user._id });

    // Send password reset email
    await sendPasswordResetEmail(email, otp, user.name || "User");

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent! Please check your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset OTP. Please try again.",
    });
  }
};


const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Get stored OTP
    const storedData = passwordResetStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      passwordResetStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    const resetToken = jwt.sign(
      { email, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      resetToken,
    });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

// api to reset password
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please try again.",
      });
    }

    if (decoded.email !== email || decoded.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token.",
      });
    }

    // Find user and update password
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Clean up password reset store
    passwordResetStore.delete(email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};


const phoneLogin = async (req, res) => {
  try {
    const { firebaseIdToken } = req.body;

    if (!firebaseIdToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(firebaseIdToken);
    } catch (error) {
      console.error("Firebase token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please try again.",
      });
    }

    const phoneNumber = decodedToken.phone_number;
    const firebaseUid = decodedToken.uid;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number not found in token",
      });
    }

    // Check if user exists with this phone number
    let user = await userModel.findOne({ phone: phoneNumber });

    if (user) {
      // User exists - login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        token,
        isNewUser: false,
        message: "Login successful!",
      });
    }


    user = await userModel.findOne({ firebaseUid });

    if (user) {

      user.phone = phoneNumber;
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        token,
        isNewUser: false,
        message: "Login successful!",
      });
    }

    // New user - create account
    const newUser = new userModel({
      name: `User_${phoneNumber.slice(-4)}`,
      phone: phoneNumber,
      firebaseUid,
      emailVerified: false,
      email: `${phoneNumber.replace("+", "")}@phone.user`,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      token,
      isNewUser: true,
      message: "Account created successfully! Welcome to Raska Mon.",
    });
  } catch (error) {
    console.error("Phone Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Phone login failed. Please try again.",
    });
  }
};

// export all user controllers
export {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile,
  bookAppointment,
  bookAppointmentCredits,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getSlotAvailability,
  cancelPayment,
  uploadReport,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  phoneLogin,
};

