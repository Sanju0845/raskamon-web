// Import MongoDB
const { MongoClient } = require("mongodb");

// MongoDB connection URI
const uri =
  "mongodb+srv://moodmantra101_db_user:Raksha2025User@cluster0.norhwve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // or your Mongo Atlas URI
const client = new MongoClient(uri);

async function insertMoodData() {
  try {
    await client.connect();
    const db = client.db("test"); // your database name
    const collection = db.collection("moods"); // your collection name

    // Load the JSON data (assuming file is in same folder)
    const data = require("./situations_dataset.json");

    // Insert multiple documents
    const result = await collection.insertMany(data);

    console.log(`${result.insertedCount} mood entries inserted successfully!`);
  } catch (err) {
    console.error("Error inserting mood data:", err);
  } finally {
    await client.close();
  }
}

insertMoodData();
