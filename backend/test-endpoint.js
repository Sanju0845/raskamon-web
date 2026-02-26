// Simple test script for the patient mood data endpoint
// Run this with: node test-endpoint.js

const axios = require("axios");

const testEndpoint = async () => {
  try {
    console.log("Testing patient mood data endpoint...");

    // Replace these with actual values from your database
    const baseURL = "http://localhost:5000";
    const doctorToken = "YOUR_DOCTOR_TOKEN"; // Get this by logging in as a doctor
    const patientId = "PATIENT_ID"; // Get this from your patients collection

    console.log("Base URL:", baseURL);
    console.log("Doctor Token:", doctorToken ? "Provided" : "Missing");
    console.log("Patient ID:", patientId ? "Provided" : "Missing");

    if (doctorToken === "YOUR_DOCTOR_TOKEN" || patientId === "PATIENT_ID") {
      console.log("\n❌ Please update the test values:");
      console.log("1. Get a doctor token by logging in as a doctor");
      console.log("2. Get a patient ID from your database");
      console.log("3. Update the variables in this script");
      return;
    }

    const response = await axios.get(
      `${baseURL}/api/doctor/patient-mood-data`,
      {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
        },
        params: {
          patientId,
          period: "30",
        },
      }
    );

    console.log("\n✅ Response received:");
    console.log("Status:", response.status);
    console.log("Success:", response.data.success);

    if (response.data.success) {
      console.log("Patient:", response.data.patient?.name);
      console.log(
        "Mood tracking enabled:",
        response.data.patient?.moodTrackingEnabled
      );
      console.log(
        "Total mood entries:",
        response.data.moodData?.totalEntries || 0
      );
      console.log(
        "AI Analysis available:",
        !!response.data.moodData?.aiAnalysis
      );
      console.log("Appointments:", response.data.appointments?.total || 0);
    } else {
      console.log("Error:", response.data.message);
    }
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
};

// Run the test
testEndpoint();
