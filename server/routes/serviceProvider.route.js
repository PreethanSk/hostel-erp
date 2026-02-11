const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { validate } = require('../helpers/validate.body');
const { validateSendOtp, validateVerifyOtp } = require("../validations/user.validation");
const { getServiceProvider, getServiceProviderCategory, insertUpdateServiceProviderCategory, insertUpdateServiceProvider, generateServiceProviderOtp, verifyServiceProviderOtp } = require('../controllers/serviceProvider.controller');


router.get(constants.path.getServiceProvider,  getServiceProvider)
router.get(constants.path.getServiceProviderCategory, verifyToken, getServiceProviderCategory)
router.post(constants.path.insertUpdateServiceProviderCategory, verifyToken, insertUpdateServiceProviderCategory)
router.post(constants.path.insertUpdateServiceProvider, verifyToken, insertUpdateServiceProvider)
router.get(constants.path.generateServiceProviderOtp, validate(validateSendOtp()), generateServiceProviderOtp)
router.get(constants.path.verifyServiceProviderOtp, validate(validateVerifyOtp()), verifyServiceProviderOtp)

module.exports = router