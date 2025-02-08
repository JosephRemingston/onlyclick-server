import Contractor from "../models/contractor.model.js";
import jwt from "jsonwebtoken";
import { createVerification, createVerificationCheck } from "../services/twilioService.js";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (contractor) => {
  return jwt.sign({ id: contractor._id, role: contractor.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Send OTP
export async function sendOTPverification(req, res) {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Please enter phone number" });
  }

  try {
    await createVerification(phoneNumber);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

export async function OTPValidation(req, res) {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ error: "Please enter phone number and OTP" });
  }

  try {
    const status = await createVerificationCheck(code, phoneNumber);

    if (status === "approved") {
      const contractor = await Contractor.findOne({
        $or: [{ phoneNumber }, { secondaryPhoneNumber: phoneNumber }],
      });

      if (contractor) {
        // Contractor exists → Login successful
        const accessToken = generateAccessToken(contractor);

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });

        return res.status(200).json({
          message: "Login successful",
          contractor: { id: contractor._id, name: contractor.name, address: contractor.address, category: contractor.category },
        });
      } else {
        return res.status(201).json({ message: "Contractor not found. Proceed to signup." });
      }
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to validate OTP" });
  }
}

// Signup
export async function signup(req, res) {
  const { name, phoneNumber, address, category } = req.body;

  if (!name || !phoneNumber || !address || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingContractor = await Contractor.findOne({
      $or: [{ phoneNumber }, { secondaryPhoneNumber: phoneNumber }],
    });

    if (existingContractor) {
      return res.status(400).json({ error: "Contractor already exists with this phone number" });
    }

    const newContractor = new Contractor({
      name,
      phoneNumber,
      address,
      category,
      role: "contractor",
      verified: true,
    });
    await newContractor.save();

    const accessToken = generateAccessToken(newContractor);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });

    return res.status(201).json({
      message: "Signup successful",
      contractor: { id: newContractor._id, name: newContractor.name, address: newContractor.address, category: newContractor.category },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create contractor" });
  }
}
