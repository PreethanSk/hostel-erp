const express = require('express');
const router = express.Router();

const constants = require('../config/constants');
const { validate } = require('../helpers/validate.body');
const { validateSendOtp, validateVerifyOtp, } = require("../validations/user.validation");

const { verifyCandidateEmailMobileOtp } = require('../controllers/otpVerify.controller');
const { candidateLoginOtp, candidateDeactivate } = require('../controllers/candidateLoginSignup.controller');
const { verifyToken } = require('../middleware/verifyAuth.middle');

router.get(constants.path.candidateOtp, validate(validateSendOtp()), candidateLoginOtp);
router.get(constants.path.candidateVerifyOtp, validate(validateVerifyOtp()), verifyCandidateEmailMobileOtp);
router.get(constants.path.candidateDeactivate, verifyToken, candidateDeactivate);

module.exports = router;