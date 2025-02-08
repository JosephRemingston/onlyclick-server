import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SIDV;
const authToken = process.env.TWILIO_AUTH_TOKENV;
const serviceID = process.env.TWILIO_SERVICE_IDV;
const client = twilio(accountSid, authToken);

async function createVerification(phoneNumber) {
  const formattedPhoneNumber = '+91' + phoneNumber;

  const messageBody = `OnlyClick: Your verification code is {OTP}. It will expire in 10 minutes.`;

  try {
    const verification = await client.verify.v2
      .services(serviceID)
      .verifications.create({
        channel: "sms",
        to: formattedPhoneNumber,
        // customMessage: messageBody, // Set custom message body
      });

    console.log(`Verification status for ${formattedPhoneNumber}: ${verification.status}`);
    return verification.status;
  } catch (error) {
    console.error("Error creating verification:", error.message);
    throw error;
  }
}

async function createVerificationCheck(verificationCode, phoneNumber) {
  try {
    const verificationCheck = await client.verify.v2
      .services(serviceID)
      .verificationChecks.create({
        code: verificationCode,
        to: "+91" + phoneNumber,
      });

    console.log(verificationCheck.status);
    return verificationCheck.status; // "approved" if successful
  } catch (error) {
    console.error("Error during OTP verification");
    throw new Error("Failed to verify OTP. Please try again.");
  }
}

export { createVerification, createVerificationCheck };