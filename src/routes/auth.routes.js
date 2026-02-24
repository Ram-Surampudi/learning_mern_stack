import {Router} from 'express'
import { register , loginUser, logout, verifyEmail, refreshAcessToken, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmail } from '../controllers/auth.controller.js';
import {validate} from '../middlewares/validator.middlewares.js';
import {userRegisterValidatior , userLoginValidatior, userForgotPasswordValidator, changeCurrentPasswordValidator} from '../validators/index.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/refresh-token").post(refreshAcessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/login").post(userLoginValidatior() , validate , loginUser);
router.route("/register").post(userRegisterValidatior() , validate ,register);
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userForgotPasswordValidator(), validate, resetForgotPassword);

router.route("/logout").post(verifyJWT , logout);
router.route("/current-user").post(verifyJWT , getCurrentUser);
router.route("/resend-email-verification").post(verifyJWT , resendEmail);
router.route("/change-password").post(verifyJWT , changeCurrentPasswordValidator() , validate, changeCurrentPassword);

export default router;