const express = require('express');

const router = express.Router();
const { sendOTPverification,OTPValidation,signup,logoutUser,isValidToken,refreshToken}=require('../Controller/OTP_verification')
const {authenticateAndVerify}=require('../../Common/middleware/middlewarVerification')
const upload=require('../../Common/middleware/multer.middleware')

//mainRoutes
router.post('/sendOTP',sendOTPverification)
router.post('/validOTP',OTPValidation)
router.post('/signup',upload.single('profileImage'),signup)
router.post('/logout',authenticateAndVerify,logoutUser)
module.exports = router;