import jwt from "jsonwebtoken";

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const dtoken = req.headers.dtoken;
    
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : dtoken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Not Authorized! Try Again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: token_decode.id };
    req.body.docId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authDoctor;
