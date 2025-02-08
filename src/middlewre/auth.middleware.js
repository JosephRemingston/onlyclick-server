const jwt = require("jsonwebtoken");
const User = require('../../User_Side/Models/User_model');
const Driver = require("../../Driver_Side/Models/driver.model");
require("dotenv").config();

// Middleware to verify token and check verification status
const authenticateAndVerify = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log('====================================');
  console.log("this is headers",req.headers);
  console.log('====================================');
  console.log("this is token",token);
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded token data to request
   
   

    if (decoded.role === "user") {
      const user = await User.findById(decoded._id);
      
      if (!user || !user.verified) {
        return res.status(403).json({ error: "User not verified or not found." });
      }
      req.currentUser = user; // Attach user data
      
    } else if (decoded.role === "driver") {
      const driver = await Driver.findById(decoded._id);
    //   console.log(driver.name)
      if (!driver || !driver.verified) {
        return res.status(403).json({ error: "Driver not verified or not found." });
      }
      req.currentDriver = driver; // Attach driver data
    } else {
      return res.status(403).json({ error: "Invalid role or unauthorized access." });
    }

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports={authenticateAndVerify};