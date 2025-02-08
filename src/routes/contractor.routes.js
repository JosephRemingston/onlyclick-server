import {Router} from 'express'
const contactorRouter=Router();
import { sendOTPverification, OTPValidation, signup } from '../controllers/contractor.controller.js';
import { authenticateAndVerify } from '../middlewre/auth.middleware.js';

//mainRoutes

contactorRouter.route('/sendOTP').post(sendOTPverification)
contactorRouter.route('/validOTP').post(OTPValidation)
contactorRouter.route('/signup').post(signup)

export default contactorRouter;