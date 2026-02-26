import axios from "axios";

const testPatientMoodEndpoint = async () => {
  try {
    // This is a test script - you'll need to replace with actual values
    const baseURL = "http://localhost:5000";
    const doctorToken = "YOUR_DOCTOR_TOKEN"; // Replace with actual token
    const patientId = "PATIENT_ID"; // Replace with actual patient ID

    console.log("Testing patient mood data endpoint...");

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

    console.log("Response:", response.data);

    if (response.data.success) {
      console.log("✅ Endpoint working correctly!");
      console.log("Patient:", response.data.patient?.name);
      console.log("Mood entries:", response.data.moodData?.totalEntries || 0);
      console.log(
        "AI Analysis available:",
        !!response.data.moodData?.aiAnalysis
      );
    } else {
      console.log("❌ Endpoint returned error:", response.data.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
};

// Uncomment to run test
// testPatientMoodEndpoint();

export default testPatientMoodEndpoint;
