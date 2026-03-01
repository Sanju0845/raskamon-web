import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";
import { v2 as cloudinary } from "cloudinary";


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist (skip on Vercel)
const uploadsDir = path.join(__dirname, "../uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.warn("⚠️  Uploads directory creation skipped (read-only filesystem)");
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "blog-image-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});


router.post("/image", authUser, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }


    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "blog-images",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });


    try {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (_) { }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

// Serve uploaded files
router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: "File not found",
    });
  }
});

// Configure multer for prescription uploads (supports images and PDFs)
const prescriptionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "prescription-" + uniqueSuffix + ext);
  },
});

const prescriptionFileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"), false);
  }
};

const prescriptionUpload = multer({
  storage: prescriptionStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for prescriptions
  },
  fileFilter: prescriptionFileFilter,
});

// Upload prescription endpoint for doctors
router.post("/prescription", authDoctor, prescriptionUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Upload to Cloudinary
    const uploadOptions = {
      folder: "prescriptions",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // Set resource_type based on file type
    if (req.file.mimetype === "application/pdf") {
      uploadOptions.resource_type = "raw";
    } else {
      uploadOptions.resource_type = "image";
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    // Remove local temp file
    try {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (_) { }

    res.status(200).json({
      success: true,
      message: "Prescription uploaded successfully",
      data: {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error uploading prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload prescription",
      error: error.message,
    });
  }
});

export default router;

