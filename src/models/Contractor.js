import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Initially false as it's collected after OTP verification
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  secondaryPhoneNumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  }
}, {
  timestamps: true
});

export default mongoose.model('Contractor', contractorSchema);