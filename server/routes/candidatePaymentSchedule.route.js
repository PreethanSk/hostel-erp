const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { getPaymentScheduleGridList, getPaymentScheduleDetailById, insertUpdatePaymentSchedule, generateCandidatePaymentSchedules, getPaymentGridList } = require('../controllers/candidatePaymentSchedule.controller');

router.get(constants.path.getPaymentScheduleGridList, verifyToken, getPaymentScheduleGridList)
router.get(constants.path.getPaymentScheduleById, verifyToken, getPaymentScheduleDetailById)
// router.post(constants.path.insertUpdatePaymentSchedule, verifyToken, insertUpdatePaymentSchedule)
router.post(constants.path.generateCandidatePaymentSchedules,  generateCandidatePaymentSchedules)
router.get(constants.path.getPaymentGridList, verifyToken, getPaymentGridList)



module.exports = router