// const getLocationData = async (req, res) => {
//   try {
//     // Step 1: Get the IP address of the client
//     const ipResponse = await fetch("https://get.geojs.io/v1/ip.json");
//     const ipData = await ipResponse.json();
//     const ip = ipData.ip;

//     // Step 2: Use the IP to get full location data with lat/lon
//     const geoResponse = await fetch(
//       `https://get.geojs.io/v1/ip/geo/${ip}.json`
//     );
//     const geoData = await geoResponse.json();

//     if (geoData.error) {
//       console.error("GeoJS Error:", geoData);
//       return res.status(429).json({ error: geoData.message });
//     }

//     const lat = parseFloat(geoData.latitude);
//     const lon = parseFloat(geoData.longitude);

//     const locationData = {
//       city: geoData.city || "Unknown City",
//       state: geoData.region || "Unknown State",
//       country: geoData.country || "Unknown Country",
//       lat,
//       lon,
//     };

//     res.json(locationData);
//   } catch (error) {
//     console.error("Error fetching location:", error);
//     res.status(500).json({ error: "Error fetching location" });
//   }
// };

import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
// const getLocationData = async (req, res) => {
//   try {
//     const ip =
//       req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

//     if (!ip) {
//       return res.status(400).json({ error: "Unable to detect IP" });
//     }

//     const geoResponse = await fetch(
//       `https://get.geojs.io/v1/ip/geo/${ip}.json`
//     );
//     const geoData = await geoResponse.json();

//     if (geoData?.error) {
//       return res.status(429).json({ error: geoData.message });
//     }

//     const locationData = {
//       lat: geoData.latitude ? Number(geoData.latitude) : null,
//       lng: geoData.longitude ? Number(geoData.longitude) : null,
//       city: geoData.city || null,
//       state: geoData.region || null,
//       country: geoData.country || null,
//       source: "ip",
//       accuracy: "low",
//     };

//     res.json({ success: true, data: locationData });
//   } catch (error) {
//     console.error("Error fetching IP location:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error fetching location" });
//   }
// };

// const getLocationData = async (req, res) => {
//   try {
//     // Step 1: Get the IP address of the client
//     const ipResponse = await fetch("https://get.geojs.io/v1/ip.json");
//     const ipData = await ipResponse.json();
//     const ip = ipData.ip;

//     // Step 2: Use the IP to get full location data with lat/lon
//     const geoResponse = await fetch(
//       `https://get.geojs.io/v1/ip/geo/${ip}.json`
//     );
//     const geoData = await geoResponse.json();

//     if (geoData.error) {
//       console.error("GeoJS Error:", geoData);
//       return res.status(429).json({ error: geoData.message });
//     }

//     const lat = parseFloat(geoData.latitude);
//     const lon = parseFloat(geoData.longitude);

//     const locationData = {
//       city: geoData.city || "Unknown City",
//       state: geoData.region || "Unknown State",
//       country: geoData.country || "Unknown Country",
//       lat,
//       lon,
//     };

//     res.json(locationData);
//   } catch (error) {
//     console.error("Error fetching location:", error);
//     res.status(500).json({ error: "Error fetching location" });
//   }
// };

const getLocationData = async (req, res) => {
  try {
    // Use the real client IP
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    const geoResponse = await fetch(
      `https://get.geojs.io/v1/ip/geo/${clientIp}.json`
    );
    const geoData = await geoResponse.json();

    const lat = parseFloat(geoData.latitude);
    const lon = parseFloat(geoData.longitude);

    res.json({
      city: geoData.city || "Unknown City",
      state: geoData.region || "Unknown State",
      country: geoData.country || "Unknown Country",
      lat,
      lon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching location" });
  }
};

const getGeoLocation = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: process.env.GOOGLE_GEOCODE_API_KEY,
        },
      }
    );

    const data = response.data;

    console.log("Google Response:", data.status);

    if (data.status !== "OK" || !data.results.length) {
      return res.status(404).json({
        success: false,
        message: data.error_message || "Address not found",
      });
    }

    const result = data.results[0];

    res.json({
      success: true,
      data: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        locationType: result.geometry.location_type,
        placeId: result.place_id,
      },
    });
  } catch (error) {
    console.error("Geocoding Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Geocoding failed",
    });
  }
};

export { getLocationData, getGeoLocation };
