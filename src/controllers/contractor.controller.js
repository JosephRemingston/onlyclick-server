import Contractor from '../models/contractor.model.js';
import jwt from 'jsonwebtoken';
import {
  createVerification,
  createVerificationCheck,
} from '../services/twilioService.js';
import dotenv from 'dotenv';

dotenv.config();

const generateAccessToken = (contractor) => {
  return jwt.sign(
    { id: contractor._id, role: contractor.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const sendOTPverification = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Please enter phone number' });
  }
  try {
    await createVerification(phoneNumber);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const OTPValidation = async (req, res) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) {
    return res.status(400).json({ error: 'Please enter phone number and OTP' });
  }
  try {
    const status = await createVerificationCheck(code, phoneNumber);
    if (status === 'approved') {
      const contractor = await Contractor.findOne({
        $or: [{ phoneNumber }, { secondaryPhoneNumber: phoneNumber }],
      });
      if (contractor) {
        const accessToken = generateAccessToken(contractor);
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
        });
        return res.status(200).json({
          message: 'Login successful',
          contractor: {
            id: contractor._id,
            name: contractor.name,
            address: contractor.address,
            category: contractor.category,
            workers: contractor.workers,
          },
        });
      } else {
        return res
          .status(201)
          .json({ message: 'Contractor not found. Proceed to signup.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to validate OTP' });
  }
};

const signup = async (req, res) => {
  const { name, phoneNumber, address, category } = req.body;
  if (!name || !phoneNumber || !address || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const existingContractor = await Contractor.findOne({
      $or: [{ phoneNumber }, { secondaryPhoneNumber: phoneNumber }],
    });
    if (existingContractor) {
      return res
        .status(400)
        .json({ error: 'Contractor already exists with this phone number' });
    }
    const newContractor = new Contractor({
      name,
      phoneNumber,
      address,
      category,
      role: 'contractor',
      verified: true,
    });
    await newContractor.save();
    const accessToken = generateAccessToken(newContractor);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });

    return res.status(201).json({
      message: 'Signup successful',
      contractor: {
        id: newContractor._id,
        name: newContractor.name,
        address: newContractor.address,
        category: newContractor.category,
        workers: newContractor.workers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contractor' });
  }
};

const addWorker = async (req, res) => {
  const { workerName } = req.body;
  const contractorId = req.contractor._id;

  if (!contractorId || !workerName) {
    return res
      .status(400)
      .json({ error: 'Contractor ID and worker name are required' });
  }

  try {
    const contractor = await Contractor.findById(contractorId);

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    if (contractor.workers.includes(workerName)) {
      return res.status(400).json({ error: 'Worker already exists' });
    }

    contractor.workers.push(workerName);
    await contractor.save();

    return res.status(200).json({
      message: 'Worker added successfully',
      workers: contractor.workers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add worker' });
  }
};

const removeWorker = async (req, res) => {
  const { workerName } = req.body;
  const contractorId = req.contractor._id;

  if (!contractorId || !workerName) {
    return res
      .status(400)
      .json({ error: 'Contractor ID and worker name are required' });
  }

  try {
    const contractor = await Contractor.findById(contractorId);

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const workerIndex = contractor.workers.indexOf(workerName);

    if (workerIndex === -1) {
      return res.status(400).json({ error: 'Worker not found' });
    }

    contractor.workers.splice(workerIndex, 1);
    await contractor.save();

    return res.status(200).json({
      message: 'Worker removed successfully',
      workers: contractor.workers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove worker' });
  }
};

const addSecondaryPhoneNumber = async (req, res) => {
  const { secondaryPhoneNumber } = req.body;
  const contractorId = req.contractor._id;

  if (!contractorId || !secondaryPhoneNumber) {
    return res
      .status(400)
      .json({ error: 'Contractor ID and secondary phone number are required' });
  }

  try {
    const contractor = await Contractor.findById(contractorId);

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    contractor.secondaryPhoneNumber = secondaryPhoneNumber;
    await contractor.save();

    return res.status(200).json({
      message: 'Secondary phone number added successfully',
      contractor: {
        id: contractor._id,
        name: contractor.name,
        address: contractor.address,
        category: contractor.category,
        secondaryPhoneNumber: contractor.secondaryPhoneNumber,
        workers: contractor.workers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add secondary phone number' });
  }
};

const validateSecondaryPhoneNumber = async (req, res) => {
  const { secondaryPhoneNumber, code } = req.body;
  const contractorId = req.contractor._id;

  if (!contractorId || !secondaryPhoneNumber || !code) {
    return res
      .status(400)
      .json({
        error: 'Contractor ID, secondary phone number, and OTP are required',
      });
  }

  try {
    const status = await createVerificationCheck(code, secondaryPhoneNumber);

    if (status === 'approved') {
      const contractor = await Contractor.findById(contractorId);

      if (!contractor) {
        return res.status(404).json({ error: 'Contractor not found' });
      }

      contractor.secondaryPhoneNumber = secondaryPhoneNumber;
      await contractor.save();

      return res.status(200).json({
        message: 'Secondary phone number added successfully',
        contractor: {
          id: contractor._id,
          name: contractor.name,
          address: contractor.address,
          category: contractor.category,
          secondaryPhoneNumber: contractor.secondaryPhoneNumber,
          workers: contractor.workers,
        },
      });
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to validate OTP' });
  }
};

export {
  sendOTPverification,
  OTPValidation,
  signup,
  addWorker,
  removeWorker,
  addSecondaryPhoneNumber,
  validateSecondaryPhoneNumber,
};
