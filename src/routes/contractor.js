import express from 'express';
import { body, validationResult } from 'express-validator';
import Contractor from '../models/Contractor.js';
import { sendOTP } from '../services/twilioService.js';

const router = express.Router();

// Request OTP
router.post('/request-otp', 
  body('phoneNumber').isMobilePhone(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber } = req.body;

      // Check if phone exists in either primary or secondary
      const existingContractor = await Contractor.findOne({
        $or: [
          { phoneNumber },
          { secondaryPhoneNumber: phoneNumber }
        ]
      });

      // Generate and send OTP
      const otp = await sendOTP(phoneNumber);
      
      // Store OTP with expiration
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

      if (existingContractor) {
        existingContractor.otp = {
          code: otp,
          expiresAt: otpExpiry
        };
        await existingContractor.save();
        return res.json({ 
          message: 'OTP sent successfully',
          isExisting: true 
        });
      }

      // Create new contractor with just phone and OTP
      const newContractor = new Contractor({
        phoneNumber,
        otp: {
          code: otp,
          expiresAt: otpExpiry
        }
      });
      await newContractor.save();

      res.json({ 
        message: 'OTP sent successfully',
        isExisting: false 
      });
    } catch (error) {
      console.error('OTP request error:', error);
      res.status(500).json({ error: 'Failed to process OTP request' });
    }
});

// Verify OTP
router.post('/verify-otp',
  body('phoneNumber').isMobilePhone(),
  body('otp').isLength({ min: 6, max: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, otp } = req.body;

      const contractor = await Contractor.findOne({
        phoneNumber,
        'otp.code': otp,
        'otp.expiresAt': { $gt: new Date() }
      });

      if (!contractor) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      contractor.isVerified = true;
      contractor.otp = undefined; // Clear OTP after verification
      await contractor.save();

      res.json({ 
        message: 'OTP verified successfully',
        isProfileComplete: !!contractor.name // Check if profile is complete
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Complete registration
router.post('/complete-profile',
  body('phoneNumber').isMobilePhone(),
  body('name').notEmpty(),
  body('address').notEmpty(),
  body('category').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, name, secondaryPhoneNumber, address, category } = req.body;

      const contractor = await Contractor.findOne({ phoneNumber });
      
      if (!contractor) {
        return res.status(404).json({ error: 'Contractor not found' });
      }

      if (!contractor.isVerified) {
        return res.status(400).json({ error: 'Phone number not verified' });
      }

      contractor.name = name;
      contractor.secondaryPhoneNumber = secondaryPhoneNumber;
      contractor.address = address;
      contractor.category = category;

      await contractor.save();

      res.json({ 
        message: 'Profile completed successfully',
        contractor: {
          name: contractor.name,
          phoneNumber: contractor.phoneNumber,
          secondaryPhoneNumber: contractor.secondaryPhoneNumber,
          address: contractor.address,
          category: contractor.category
        }
      });
    } catch (error) {
      console.error('Profile completion error:', error);
      res.status(500).json({ error: 'Failed to complete profile' });
    }
});

export default router;