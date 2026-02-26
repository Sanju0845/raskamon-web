import jwt from "jsonwebtoken";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    // Check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    let token;

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to check for token in headers directly
      token = req.headers.token;
    }

    console.log('Token found:', token ? 'Yes' : 'No');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized! Try Again.",
      });
    }

    // Verify the token and decode its contents
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Adding user ID to the request object
    req.user = { id: token_decode.id };

    console.log('User ID set:', req.user.id);
    next();
  } catch (error) {
    console.log('Auth error:', error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authUser;
