const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { generateInvoicePDF, getCandidateTransactionList } = require('../controllers/sendInvoice.controller');


router.get(constants.path.getCandidateTransactionList, verifyToken, getCandidateTransactionList);
router.get(constants.path.generateInvoicePDF, generateInvoicePDF);

module.exports = router;