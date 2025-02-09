import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const contractorSchema = new mongoose.Schema(
  {
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
    workers: [
      {
        type: String,
        required: false,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

contractorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      phoneNumber: this.phoneNumber,
      address: this.address,
      category:this.category  
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Generate Refresh Token
contractorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '10d' }
  );
};

export default mongoose.model('Contractor', contractorSchema);
