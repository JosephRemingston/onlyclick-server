import { Router } from 'express';
const contactorRouter = Router();
import {
  sendOTPverification,
  OTPValidation,
  signup,
  addSecondaryPhoneNumber
} from '../controllers/contractor.controller.js';
import { authenticateAndVerify } from '../middlewre/auth.middleware.js';
import {
  addWorker,
  removeWorker,
} from '../controllers/contractor.controller.js';

contactorRouter.route('/sendOTP').post(sendOTPverification);
contactorRouter.route('/validOTP').post(OTPValidation);
contactorRouter.route('/signup').post(signup);
contactorRouter.route('/addWorker').post(authenticateAndVerify, addWorker);
contactorRouter
  .route('/removeWorker')
  .post(authenticateAndVerify, removeWorker);
  contactorRouter.route('/addSecondaryPhoneNumber').post(authenticateAndVerify, addSecondaryPhoneNumber);
export default contactorRouter;
