import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import blogPostModel from "../models/blogPostModel.js";
import axios from "axios";
// Api for adding Doctor

const addDoctor = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    console.log("Incoming files:", req.files);

    const {
      name,
      email,
      meetEmail,
      password,
      speciality,
      degree,
      language,
      experience,
      about,
      fees,
      address,
      patients,
      rating,
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Doctor image is required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (meetEmail && !validator.isEmail(meetEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid meeting email",
      });
    }

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "doctors/images",
    });

    // Upload video if exists
    let videoUrl = null;
    if (videoFile) {
      try {
        const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video",
          folder: "doctors/videos",
          chunk_size: 6000000,
        });
        videoUrl = videoUpload.secure_url;
      } catch (err) {
        console.log("Video upload failed, skipping...");
      }
    }

    // Parse address
    let parsedAddress = { line1: "", line2: "" };
    if (address) {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress.line1 = address;
      }
    }

    // Default location
    let location = {
      type: "Point",
      coordinates: [0, 0],
    };

    // If address line1 exists, get geolocation from Google API
    if (parsedAddress.line1) {
      try {
        const geoResponse = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              address: parsedAddress.line1,
              key: process.env.GOOGLE_GEOCODE_API_KEY,
            },
          },
        );

        const geoData = geoResponse.data;

        if (geoData.status === "OK" && geoData.results.length > 0) {
          const result = geoData.results[0];
          location.coordinates = [
            result.geometry.location.lng,
            result.geometry.location.lat,
          ];
        } else {
          console.log("Geocoding failed, using default coordinates");
        }
      } catch (err) {
        console.log("Geocoding error:", err.message);
      }
    }

    const doctorData = {
      name,
      email,
      meetEmail,
      password: hashedPassword,
      speciality,
      degree,
      languageSpoken: language,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress,
      location,
      image: imageUpload.secure_url,
      video: videoUrl,
      patients: patients ? Number(patients) : 0,
      rating: rating ? Number(rating) : 0,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully 🎉",
      data: newDoctor,
    });
  } catch (error) {
    console.error("Add doctor error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Api for updating Doctor
const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const {
      name,
      email,
      meetEmail,
      password,
      speciality,
      degree,
      language, // added
      experience,
      about,
      fees,
      address,
      patients,
      rating,
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    // Find doctor
    const existingDoctor = await doctorModel.findById(doctorId);
    if (!existingDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    // Email validation
    if (email && email !== existingDoctor.email && !validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email." });
    }

    // Password hashing if provided
    let hashedPassword = existingDoctor.password;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Upload image if provided
    let imageUrl = existingDoctor.image;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: "doctors/images",
      });
      imageUrl = imageUpload.secure_url;
    }

    // Upload video if provided
    let videoUrl = existingDoctor.video;
    if (videoFile) {
      try {
        const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video",
          folder: "doctors/videos",
          chunk_size: 6000000,
        });
        videoUrl = videoUpload.secure_url;
      } catch (error) {
        console.log("Video upload failed");
      }
    }

    // Parse address
    let parsedAddress = { line1: "", line2: "" };
    if (address) {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress.line1 = address;
      }
    }

    // Default location
    let location = {
      type: "Point",
      coordinates: [0, 0],
    };

    // If address line1 exists, get geolocation from Google API
    if (parsedAddress.line1) {
      try {
        const geoResponse = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              address: parsedAddress.line1,
              key: process.env.GOOGLE_GEOCODE_API_KEY,
            },
          },
        );

        const geoData = geoResponse.data;

        if (geoData.status === "OK" && geoData.results.length > 0) {
          const result = geoData.results[0];
          location.coordinates = [
            result.geometry.location.lng,
            result.geometry.location.lat,
          ];
        } else {
          console.log("Geocoding failed, using default coordinates");
        }
      } catch (err) {
        console.log("Geocoding error:", err.message);
      }
    }

    // Update fields
    existingDoctor.name = name || existingDoctor.name;
    existingDoctor.email = email || existingDoctor.email;
    existingDoctor.meetEmail = meetEmail || existingDoctor.meetEmail;
    existingDoctor.password = hashedPassword;
    existingDoctor.speciality = speciality || existingDoctor.speciality;
    existingDoctor.degree = degree || existingDoctor.degree;
    existingDoctor.languageSpoken = language || existingDoctor.languageSpoken;
    existingDoctor.experience = experience || existingDoctor.experience;
    existingDoctor.about = about || existingDoctor.about;
    existingDoctor.fees = fees ? Number(fees) : existingDoctor.fees;
    existingDoctor.address = parsedAddress;
    existingDoctor.location = location || existingDoctor.location;
    existingDoctor.image = imageUrl;
    existingDoctor.video = videoUrl;
    existingDoctor.patients = patients
      ? Number(patients)
      : existingDoctor.patients;
    existingDoctor.rating = rating ? Number(rating) : existingDoctor.rating;
    existingDoctor.date = Date.now();

    await existingDoctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully! 🎉",
      doctor: existingDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// API for the admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({ success: true, message: "Admin Logged In 🎉", token });
    } else {
      return res.json({ success: false, message: "Invalid Credentials." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ is_hidden: false }) // only fetch visible doctors
      .select("-password");

    res.json({ success: true, doctors });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Api to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Api for appointment cancellation from admin panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.status(201).json({ success: true, message: "Appointment Cancelled!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api to get dashboard data for admin
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const pendingPosts = await blogPostModel.countDocuments({
      status: "pending",
    });

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      pendingPosts: pendingPosts,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.status(201).json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get all patients list for admin panel with appointment statistics
const allPatients = async (req, res) => {
  try {
    const patients = await userModel.find({}).select("-password");

    // Get all appointments to calculate statistics
    const appointments = await appointmentModel.find({});

    // Enhance patients data with appointment statistics
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        // Get appointments for this specific patient
        const patientAppointments = appointments.filter(
          (app) => app.userId === patient._id.toString(),
        );

        // Calculate total amount paid by this patient
        const totalAmount = patientAppointments.reduce((sum, app) => {
          if (app.isCompleted || app.payment) {
            return sum + app.amount;
          }
          return sum;
        }, 0);

        // Get appointment statistics
        const totalAppointments = patientAppointments.length;
        const completedAppointments = patientAppointments.filter(
          (app) => app.isCompleted,
        ).length;
        const cancelledAppointments = patientAppointments.filter(
          (app) => app.cancelled,
        ).length;
        const pendingAppointments = patientAppointments.filter(
          (app) => !app.isCompleted && !app.cancelled,
        ).length;

        // Get latest appointment
        const latestAppointment = patientAppointments.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        )[0];

        return {
          ...patient.toObject(),
          // Appointment statistics
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          pendingAppointments,
          totalAmount,
          latestAppointment: latestAppointment
            ? {
                date: latestAppointment.slotDate,
                time: latestAppointment.slotTime,
                status: latestAppointment.cancelled
                  ? "Cancelled"
                  : latestAppointment.isCompleted
                    ? "Completed"
                    : "Pending",
                amount: latestAppointment.amount,
                doctorName: latestAppointment.docData?.name || "Unknown",
              }
            : null,
        };
      }),
    );

    // Sort by latest appointment
    const sortedPatients = patientsWithStats.sort((a, b) => {
      if (!a.latestAppointment && !b.latestAppointment) return 0;
      if (!a.latestAppointment) return 1;
      if (!b.latestAppointment) return -1;
      return (
        new Date(b.latestAppointment.date) - new Date(a.latestAppointment.date)
      );
    });

    res.json({
      success: true,
      patients: sortedPatients,
      totalPatients: sortedPatients.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// API to download patient details PDF for last 30 days
const downloadPatientsPDF = async (req, res) => {
  try {
    const { reportType = "30months" } = req.query;

    // Calculate date based on report type
    let startDate, periodText, periodDays;

    switch (reportType) {
      case "12months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        periodText = "Last 12 Months";
        periodDays = 365;
        break;
      case "6months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        periodText = "Last 6 Months";
        periodDays = 180;
        break;
      case "30months":
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        periodText = "Last 30 Days";
        periodDays = 30;
        break;
    }

    const startDateTimestamp = startDate.getTime();

    // Get all patients (we want all patient details, not just those who joined in last 30 days)
    const patients = await userModel.find({}).select("-password");

    // Get appointments from the selected period
    const appointments = await appointmentModel.find({
      date: { $gte: startDateTimestamp },
    });

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      info: {
        Title: `Patient Details Report for ${periodText}`,
        Author: "MOOD MANTA",
        Subject: "Patient Details and Analytics",
        Keywords: "patients, appointments, analytics",
        CreationDate: new Date(),
      },
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="patient-details-${reportType}-${
        new Date().toISOString().split("T")[0]
      }.pdf"`,
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title page
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("Patient Details Report", { align: "center" })
      .moveDown(2);

    doc
      .fontSize(16)
      .font("Helvetica")
      .text("Mental Health Platform", { align: "center" })
      .moveDown(2);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "center",
      })
      .text(
        `Period: ${periodText} (${startDate.toLocaleDateString()} - ${new Date().toLocaleDateString()})`,
        { align: "center" },
      )
      .moveDown(3);

    // Add summary statistics
    const totalPatients = patients.length;
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(
      (app) => app.isCompleted,
    ).length;
    const cancelledAppointments = appointments.filter(
      (app) => app.cancelled,
    ).length;
    const pendingAppointments = appointments.filter(
      (app) => !app.isCompleted && !app.cancelled,
    ).length;
    const totalRevenue = appointments
      .filter((app) => app.isCompleted || app.payment)
      .reduce((sum, app) => sum + app.amount, 0);

    // Summary section
    doc.addPage();
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Executive Summary", { underline: true })
      .moveDown(2);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Key Statistics:", { underline: true })
      .moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`• Total Patients: ${totalPatients}`)
      .text(`• Appointments (${periodText}): ${totalAppointments}`)
      .text(`• Completed Appointments: ${completedAppointments}`)
      .text(`• Pending Appointments: ${pendingAppointments}`)
      .text(`• Cancelled Appointments: ${cancelledAppointments}`)
      .text(
        `• Total Revenue (${periodText}): ₹${totalRevenue.toLocaleString()}`,
      )
      .text(
        `• Average Revenue per Patient: ₹${
          totalPatients > 0 ? (totalRevenue / totalPatients).toFixed(2) : 0
        }`,
      )
      .moveDown(2);

    // Calculate completion rate
    const completionRate =
      totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
        : 0;
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`• Appointment Completion Rate: ${completionRate}%`)
      .moveDown(2);

    // Process each patient
    if (patients.length > 0) {
      doc.addPage();
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Patient Details", { underline: true })
        .moveDown(2);

      patients.forEach((patient, index) => {
        // Get appointments for this patient from the selected period
        const patientAppointments = appointments.filter(
          (app) => app.userId === patient._id.toString(),
        );

        // Calculate patient statistics
        const patientTotalAppointments = patientAppointments.length;
        const patientCompletedAppointments = patientAppointments.filter(
          (app) => app.isCompleted,
        ).length;
        const patientCancelledAppointments = patientAppointments.filter(
          (app) => app.cancelled,
        ).length;
        const patientTotalAmount = patientAppointments
          .filter((app) => app.isCompleted || app.payment)
          .reduce((sum, app) => sum + app.amount, 0);

        // Add page break if not first patient and if we're near the bottom
        if (index > 0 && doc.y > 600) {
          doc.addPage();
        }

        // Patient header
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${patient.name}`, { underline: true })
          .moveDown(0.5);

        // Patient details
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`Email: ${patient.email}`)
          .text(`Phone: ${patient.phone}`)
          .text(`Gender: ${patient.gender || "Not specified"}`)
          .text(
            `Date of Birth: ${
              patient.dob
                ? new Date(patient.dob).toLocaleDateString()
                : "Not specified"
            }`,
          )
          .text(
            `Joined Date: ${new Date(patient.joinedDate).toLocaleDateString()}`,
          )
          .moveDown(0.5);

        // Address
        if (patient.address) {
          const address =
            typeof patient.address === "string"
              ? patient.address
              : `${patient.address.line1 || ""} ${
                  patient.address.line2 || ""
                }`.trim();
          doc.text(`Address: ${address || "Not provided"}`);
        }

        // Patient statistics (selected period)
        doc
          .moveDown(0.5)
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(`Appointments (${periodText}):`, { underline: true })
          .moveDown(0.3);

        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`• Total Appointments: ${patientTotalAppointments}`)
          .text(`• Completed: ${patientCompletedAppointments}`)
          .text(`• Cancelled: ${patientCancelledAppointments}`)
          .text(`• Total Amount Paid: ₹${patientTotalAmount.toLocaleString()}`)
          .moveDown(0.5);

        // Recent appointments (last 5 from the 30-day period)
        if (patientAppointments.length > 0) {
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`Recent Appointments (${periodText}):`, { underline: true })
            .moveDown(0.3);

          const recentAppointments = patientAppointments
            .sort((a, b) => b.date - a.date) // Sort by timestamp
            .slice(0, 5);

          recentAppointments.forEach((app) => {
            const status = app.cancelled
              ? "Cancelled"
              : app.isCompleted
                ? "Completed"
                : "Pending";
            const doctorName = app.docData?.name || "Unknown Doctor";
            const appointmentDate = new Date(app.date).toLocaleDateString();

            doc
              .fontSize(10)
              .font("Helvetica")
              .text(
                `• ${appointmentDate} at ${app.slotTime} - ${doctorName} (${status}) - ₹${app.amount}`,
              );
          });
        } else {
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`No appointments in the ${periodText.toLowerCase()}`)
            .moveDown(0.3);
        }

        doc.moveDown(1.5);
      });
    } else {
      doc.addPage();
      doc.fontSize(16).font("Helvetica").text("No patients found.", {
        align: "center",
      });
    }

    // Add footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Report generated on ${new Date().toLocaleString()}`, {
        align: "center",
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: `Error generating PDF: ${error.message}`,
    });
  }
};

// API to download all patients report as Excel
const downloadPatientsExcel = async (req, res) => {
  try {
    const { reportType = "30months" } = req.query;

    // Calculate date based on report type
    let startDate, periodText, periodDays;

    switch (reportType) {
      case "12months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        periodText = "Last 12 Months";
        periodDays = 365;
        break;
      case "6months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        periodText = "Last 6 Months";
        periodDays = 180;
        break;
      case "30months":
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        periodText = "Last 30 Days";
        periodDays = 30;
        break;
    }

    const startDateTimestamp = startDate.getTime();

    // Get all patients
    const patients = await userModel.find({}).select("-password");

    // Get appointments from the selected period
    const appointments = await appointmentModel.find({
      date: { $gte: startDateTimestamp },
    });

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patients Report");

    // Set up headers
    worksheet.columns = [
      { header: "Patient Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Age", key: "age", width: 10 },
      { header: "Joined Date", key: "joinedDate", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Total Appointments", key: "totalAppointments", width: 15 },
      {
        header: "Completed Appointments",
        key: "completedAppointments",
        width: 20,
      },
      {
        header: "Cancelled Appointments",
        key: "cancelledAppointments",
        width: 20,
      },
      { header: "Total Amount Paid", key: "totalAmount", width: 15 },
      { header: "Last Appointment Date", key: "lastAppointment", width: 20 },
      {
        header: "Last Appointment Status",
        key: "lastAppointmentStatus",
        width: 20,
      },
      { header: "Last Doctor", key: "lastDoctor", width: 20 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Add data rows
    patients.forEach((patient, index) => {
      // Get appointments for this patient from the selected period
      const patientAppointments = appointments.filter(
        (app) => app.userId === patient._id.toString(),
      );

      // Calculate patient statistics
      const patientTotalAppointments = patientAppointments.length;
      const patientCompletedAppointments = patientAppointments.filter(
        (app) => app.isCompleted,
      ).length;
      const patientCancelledAppointments = patientAppointments.filter(
        (app) => app.cancelled,
      ).length;
      const patientTotalAmount = patientAppointments
        .filter((app) => app.isCompleted || app.payment)
        .reduce((sum, app) => sum + app.amount, 0);

      // Get last appointment details
      const lastAppointment = patientAppointments
        .sort((a, b) => b.date - a.date)
        .find(() => true);

      // Calculate age
      const age = patient.dob
        ? Math.floor(
            (new Date() - new Date(patient.dob)) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : "N/A";

      // Format address
      const address = patient.address
        ? typeof patient.address === "string"
          ? patient.address
          : `${patient.address.line1 || ""} ${
              patient.address.line2 || ""
            }`.trim()
        : "Not provided";

      // Add row data
      worksheet.addRow({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender || "Not specified",
        dob: patient.dob
          ? new Date(patient.dob).toLocaleDateString()
          : "Not specified",
        age: age,
        joinedDate: new Date(patient.joinedDate).toLocaleDateString(),
        address: address,
        totalAppointments: patientTotalAppointments,
        completedAppointments: patientCompletedAppointments,
        cancelledAppointments: patientCancelledAppointments,
        totalAmount: `₹${patientTotalAmount.toLocaleString()}`,
        lastAppointment: lastAppointment
          ? new Date(lastAppointment.date).toLocaleDateString()
          : "No appointments",
        lastAppointmentStatus: lastAppointment
          ? lastAppointment.cancelled
            ? "Cancelled"
            : lastAppointment.isCompleted
              ? "Completed"
              : "Pending"
          : "N/A",
        lastDoctor: lastAppointment?.docData?.name || "N/A",
      });
    });

    // Add summary statistics worksheet
    const summaryWorksheet = workbook.addWorksheet("Summary Statistics");

    // Calculate summary statistics
    const totalPatients = patients.length;
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(
      (app) => app.isCompleted,
    ).length;
    const cancelledAppointments = appointments.filter(
      (app) => app.cancelled,
    ).length;
    const pendingAppointments = appointments.filter(
      (app) => !app.isCompleted && !app.cancelled,
    ).length;
    const totalRevenue = appointments
      .filter((app) => app.isCompleted || app.payment)
      .reduce((sum, app) => sum + app.amount, 0);
    const completionRate =
      totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
        : 0;

    // Add summary data
    summaryWorksheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    const summaryHeaderRow = summaryWorksheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
    summaryHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };

    summaryWorksheet.addRow({ metric: "Report Period", value: periodText });
    summaryWorksheet.addRow({ metric: "Total Patients", value: totalPatients });
    summaryWorksheet.addRow({
      metric: "Total Appointments",
      value: totalAppointments,
    });
    summaryWorksheet.addRow({
      metric: "Completed Appointments",
      value: completedAppointments,
    });
    summaryWorksheet.addRow({
      metric: "Pending Appointments",
      value: pendingAppointments,
    });
    summaryWorksheet.addRow({
      metric: "Cancelled Appointments",
      value: cancelledAppointments,
    });
    summaryWorksheet.addRow({
      metric: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
    });
    summaryWorksheet.addRow({
      metric: "Average Revenue per Patient",
      value: `₹${
        totalPatients > 0 ? (totalRevenue / totalPatients).toFixed(2) : 0
      }`,
    });
    summaryWorksheet.addRow({
      metric: "Appointment Completion Rate",
      value: `${completionRate}%`,
    });
    summaryWorksheet.addRow({
      metric: "Report Generated On",
      value: new Date().toLocaleString(),
    });

    // Set response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="patient-details-${reportType}-${
        new Date().toISOString().split("T")[0]
      }.xlsx"`,
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({
      success: false,
      message: `Error generating Excel: ${error.message}`,
    });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Doctor ID required!" });
    }

    const data = await doctorModel.findById(id);

    if (!data) {
      return res.status(404).json({ message: "No doctor data found!" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting doctor:", error);
    res.status(500).json({
      success: false,
      message: `Error getting doctor: ${error.message}`,
    });
  }
};
const deleteDoctorById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Doctor ID required!" });
    }

    const doctor = await doctorModel.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "No doctor data found!" });
    }

    doctor.is_hidden = true;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor has been deleted successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error delete doctor:", error);
    res.status(500).json({
      success: false,
      message: `Error delete doctor: ${error.message}`,
    });
  }
};

export {
  addDoctor,
  updateDoctor,
  deleteDoctorById,
  getDoctorById,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  allPatients,
  downloadPatientsPDF,
  downloadPatientsExcel,
};
