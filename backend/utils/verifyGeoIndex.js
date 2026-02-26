import mongoose from "mongoose";

export async function verifyGeoIndex() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("doctors");

    const indexes = await collection.indexes();

    const hasGeoIndex = indexes.some((idx) => idx.key?.location === "2dsphere");

    if (!hasGeoIndex) {
      console.error("🚨 CRITICAL: Missing 2dsphere index on doctors.location");

      if (process.env.NODE_ENV === "production") {
        console.error("🚨 Geo search DISABLED until index is created");
      }

      // Create automatically (safe)
      await collection.createIndex(
        { location: "2dsphere" },
        { name: "location_2dsphere", background: true },
      );

      console.log("✅ Geo index auto-created");
    } else {
      if (process.env.NODE_ENV === "production") {
        console.log("✅ Geo index verified");
      }
    }
  } catch (err) {
    console.error("💥 Geo index verification failed:", err.message);
  }
}
