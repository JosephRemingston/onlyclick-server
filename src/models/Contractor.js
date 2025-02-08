import mongoose from 'mongoose';
const jwt = require("jsonwebtoken");

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
contractorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      mobileNumber: this.mobileNumber,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Generate Refresh Token
contractorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10d" }
  );
};

export default mongoose.model('Contractor', contractorSchema);