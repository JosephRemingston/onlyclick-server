const User = require("../Models/User_model");
const jwt = require("jsonwebtoken");
const {
  createVerification,
  createVerificationCheck,
} = require("../../Services/Twilio_intigration");
require("dotenv").config();

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

// Send OTP
async function sendOTPverification(req, res) {
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

async function OTPValidation(req, res) {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ error: "Please enter phone number and OTP" });
  }

  try {
    const status = await createVerificationCheck(code, phoneNumber);

    if (status === "approved") {
      const user = await User.findOne({ mobileNumber: phoneNumber });

      if (user) {
        // User exists → Login successful
        const { accessToken, refreshToken } =
          await generateAccessAndRefreshToken(user);

        return res.status(200).json({
          message: "Login successful",
          accessToken,
          refreshToken,
          user: { id: user._id, name: user.name, role: user.role },
        });
      } else {
        return res
          .status(201)
          .json({ message: "User not found. Proceed to signup." });
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
async function signup(req, res) {
  const { name, mobileNumber, email, gender, dob, address } = req.body;

  if (!name || !mobileNumber || !email || !dob || !address || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }


  try {
    const existingUser = await User.findOne({ mobileNumber });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this phone number" });
    }

    const newUser = new User({
      name,
      mobileNumber,
      email,
      dob: new Date(dob),
      gender,
      address,
      role: "user",
      verified: true,
      profileImage: {
        url: profileImage.url,
        publicId: profileImage.public_id,
      },
    });
    await newUser.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      newUser
    );

    return res.status(201).json({
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: { id: newUser._id, name: newUser.name, role: newUser.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}


const logoutUser = async function (req, res) {

  try {
    await User.findByIdAndUpdate(
      req.currentUser._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    );
    req.currentUser=null
    return res.status(200).json({ message: "User Logged Out successfully" });
  } catch (error) {

    console.log("error while loggingout",error);
   
  }
};


module.exports = {
  sendOTPverification,
  OTPValidation,
  signup,
  logoutUser,
};
