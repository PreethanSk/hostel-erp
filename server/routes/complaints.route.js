const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { getComplaintsGridList, insertUpdateComplaints, getComplaintsDetailById, getComplaintsByStatus, updateComplaintStatus } = require('../controllers/complaints.controller');

router.get(constants.path.getComplaintsGridList, verifyToken, getComplaintsGridList)
router.get(constants.path.getComplaintsDetailById, verifyToken, getComplaintsDetailById)
router.get(constants.path.getComplaintsByStatus, verifyToken, getComplaintsByStatus)
router.post(constants.path.insertUpdateComplaints, verifyToken, insertUpdateComplaints)
router.post(constants.path.updateComplaintStatus, verifyToken, updateComplaintStatus)


module.exports = router