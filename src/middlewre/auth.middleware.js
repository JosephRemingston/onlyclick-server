import jwt from 'jsonwebtoken';
import Contractor from '../models/contractor.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to verify token and check verification status
const authenticateAndVerify = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded token data to request

    if (decoded.role === 'contractor') {
      const contractor = await Contractor.findById(decoded._id);

      if (!contractor || !contractor.verified) {
        return res
          .status(403)
          .json({ error: 'Contractor not verified or not found.' });
      }
      req.currentContractor = contractor; // Attach contractor data
    } else if (decoded.role === 'driver') {
      const driver = await Driver.findById(decoded._id);
      if (!driver || !driver.verified) {
        return res
          .status(403)
          .json({ error: 'Driver not verified or not found.' });
      }
      req.currentDriver = driver; // Attach driver data
    } else {
      return res
        .status(403)
        .json({ error: 'Invalid role or unauthorized access.' });
    }

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export { authenticateAndVerify };
