import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

async function migrateGeoIndex() {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;
    const collection = db.collection("doctors");

    const indexes = await collection.indexes();

    const hasGeoIndex = indexes.some(
      (idx) => idx.key && idx.key.location === "2dsphere",
    );

    if (hasGeoIndex) {
      console.log("✅ 2dsphere index already exists");
    } else {
      console.log("⚠️ 2dsphere index missing. Creating...");
      await collection.createIndex(
        { location: "2dsphere" },
        { name: "location_2dsphere", background: true },
      );
      console.log("✅ 2dsphere index created successfully");
    }

    process.exit(0);
  } catch (err) {
    console.error("💥 Geo index migration failed:", err.message);
    process.exit(1);
  }
}

migrateGeoIndex();
