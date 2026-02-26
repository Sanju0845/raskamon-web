import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const storage = new CloudinaryStorage({
  cloudinary, // this is the correct key
  params: {
    folder: "reports",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
    resource_type: "auto",
  },
});

const uploadToCloudinary = multer({ storage });

export default uploadToCloudinary;
