const express = require('express');
const router = express.Router();

const constants = require('../config/constants');
const { validate } = require('../helpers/validate.body');
const { validateLogin, validateRegister, validateSendOtp, validateVerifyOtp, } = require("../validations/user.validation");
const { userLogin, userLogout, userRegister, userSendOtp, getUserGridList, bulkUploadUsers } = require("../controllers/userSession.controller");
const { test, } = require("../controllers/user.controller");

const { verifyToken } = require('../middleware/verifyAuth.middle');
const { verifyEmailMobileOtpLogin } = require('../controllers/otpVerify.controller');


router.get(constants.path.home, test);
router.post(constants.path.userRegister, validate(validateRegister()), userRegister);
router.post(constants.path.userLogin, validate(validateLogin()), userLogin);
router.get(constants.path.userSendOtp, validate(validateSendOtp()), userSendOtp);
router.get(constants.path.userVerifyOtp, validate(validateVerifyOtp()), verifyEmailMobileOtpLogin);
router.get(constants.path.getUserGridList, verifyToken, getUserGridList);
router.post(constants.path.userLogOut, verifyToken, userLogout);
router.post(constants.path.bulkUploadUsers, verifyToken, bulkUploadUsers);

module.exports = router;