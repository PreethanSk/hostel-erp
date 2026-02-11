const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { gatewayPortalPage, updatePaymentStatus } = require('./payment.controller');
const { handleSuccessPayment } = require('./components/ReturnUrl');

router.post(constants.path.getPaymentPage, gatewayPortalPage)
router.post(constants.path.getPaymentSuccess, handleSuccessPayment)
router.post(constants.path.updatePaymentStatus, updatePaymentStatus)
module.exports = router