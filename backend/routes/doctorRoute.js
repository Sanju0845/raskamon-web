import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorPatients,
  downloadDoctorPatientsPDF,
  downloadDoctorPatientsExcel,
  getPatientMoodData,
  updateMedication,
  getNearbyDoctors,
  doctorById,
  getDoctorAvailability,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);

doctorRouter.get("/list/nearby", getNearbyDoctors);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/update-medication", updateMedication);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);
doctorRouter.get("/patients", authDoctor, getDoctorPatients);
doctorRouter.get(
  "/download-patients-pdf",
  authDoctor,
  downloadDoctorPatientsPDF,
);
doctorRouter.get(
  "/download-patients-excel",
  authDoctor,
  downloadDoctorPatientsExcel,
);
doctorRouter.get("/patient-mood-data", authDoctor, getPatientMoodData);
doctorRouter.get("/availability/:id", getDoctorAvailability);
doctorRouter.get("/:id", doctorById);
export default doctorRouter;

