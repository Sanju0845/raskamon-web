import process from "node:process";
import fs from "node:fs";
import { google } from "googleapis";

export const parseAppointmentDate = (dateStr, timeStr) => {
  // dateStr = "14/01/2026", timeStr = "05:30 PM"
  const [day, month, year] = dateStr.split("/").map(Number);
  let [hours, minutes] = timeStr.split(/[: ]/);
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (timeStr.toUpperCase().includes("PM") && hours !== 12) hours += 12;
  if (timeStr.toUpperCase().includes("AM") && hours === 12) hours = 0;

  const date = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`);
  }

  return date;
};

let credentials = null;

try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  } else if (fs.existsSync("./service-account.json")) {
    credentials = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
  } else {
    console.warn("⚠️  Google Meet: No credentials found. Meet link generation disabled.");
  }
} catch (error) {
  console.error("Error loading Google credentials:", error.message);
}

// const CREDENTIALS_PATH = path.join(process.cwd(), "service-account.json");
const WORKSPACE_HOST_EMAIL = process.env.WORKSPACE_HOST_EMAIL;
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

export const generateGoogleMeetLink = async (appointment) => {
  try {
    // Return null if no credentials available
    if (!credentials) {
      console.log("📅 No Google credentials, skipping Meet link generation");
      return null;
    }
    
    console.log(`📅 Creating Google Meet for appointment ${appointment._id}`);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
      clientOptions: {
        subject: WORKSPACE_HOST_EMAIL,
      },
    });

    const client = await auth.getClient();
    const calendar = google.calendar({ version: "v3", auth: client });

    const startDate = parseAppointmentDate(
      appointment.slotDate,
      appointment.slotTime,
    );
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const event = {
      summary: `Appointment: ${appointment.userData?.name} with Dr. ${appointment.docData?.name}`,
      description: `Reason: ${appointment.reasonForVisit}`,

      organizer: {
        email: WORKSPACE_HOST_EMAIL,
        displayName: "MoodMantra Appointments",
      },

      start: {
        dateTime: startDate.toISOString().replace("Z", ""),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDate.toISOString().replace("Z", ""),
        timeZone: "Asia/Kolkata",
      },

      attendees: [
        { email: appointment.docData?.meetEmail },
        { email: appointment.userData?.email },
      ],

      conferenceData: {
        createRequest: {
          requestId: `meet-${appointment._id}-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },

      guestsCanModify: false,
      guestsCanInviteOthers: false,
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    // console.log("📌 Google Calendar API response:", response.data);

    const meetUrl = response.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video",
    )?.uri;

    if (!meetUrl) {
      console.error("❌ Meet link not generated", response.data);
      return null;
    }

    console.log("✅ Meet link generated:", meetUrl);
    return meetUrl;
  } catch (err) {
    console.error("❌ Meet generation failed:", err.message);
    return null;
  }
};
