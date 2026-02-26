import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json({ limit: "400mb" }));
app.use(cors());

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.get("/", (req, res) => {
  res.send("API WORKING...");
});

// Start server
app.listen(port, () => {
  console.log("Test server running on port", port);
  console.log("Environment variables:");
  console.log("PORT:", process.env.PORT);
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
});
