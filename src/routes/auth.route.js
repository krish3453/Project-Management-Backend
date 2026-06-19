import { Router } from "express";
import {changecurrPassword, forgotPassword, getcurrUser, login, logoutUser, refreshaccesstoken, registerUser, resendEmailVerification, resetforgotPassword, verifyEmail}from "../controllers/auth.controller.js"
import { validate}  from "../middlewares/validator.mid.js";
import { userChangecurrPass, userforgotPassvali, userLoginValidator, userRegisterValidator, userresetforgotPassvali } from "../validators/index.js";
import { verifyjwt } from "../middlewares/auth.mid.js";


const router= Router();

//UNSECURE
router.route("/register").post(userRegisterValidator(),validate,registerUser);

router.route("/login").post(userLoginValidator(),validate,login);

router.route("/verifyemail/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshaccesstoken);

router.route("/forgot-password").post(userforgotPassvali(),validate,forgotPassword);

router.route("/reset-password/:resetToken").post(userresetforgotPassvali(),validate,resetforgotPassword);

//SECURE ROUTES
router.route("/logout").post(verifyjwt,logoutUser);

router.route("/currentUser").post(verifyjwt,getcurrUser);

router.route("/changepass").post(verifyjwt,userChangecurrPass(),validate,changecurrPassword);

router.route("/resendemailveri").post(verifyjwt,resendEmailVerification);


export default router;