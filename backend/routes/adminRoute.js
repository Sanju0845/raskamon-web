import express from "express";
import {
  addDoctor,
  allDoctors,
  getDoctorById,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  allPatients,
  downloadPatientsPDF,
  downloadPatientsExcel,
  updateDoctor,
  deleteDoctorById,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// In your route
adminRouter.post(
  "/add-doctor",
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addDoctor
);
adminRouter.put(
  "/update/doctor/:id",
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateDoctor
);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.get("/doctor/:id", authAdmin, getDoctorById);
adminRouter.delete("/delete/:id", authAdmin, deleteDoctorById);
adminRouter.get("/patients", authAdmin, allPatients);
adminRouter.get("/download-patients-pdf", authAdmin, downloadPatientsPDF);
adminRouter.get("/download-patients-excel", authAdmin, downloadPatientsExcel);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
