const express = require("express");
const router = express.Router();
const constants = require("../config/constants");
const { verifyToken } = require("../middleware/verifyAuth.middle");
const {
  getDashboardPayments,
  getDashboardBookings,
  getDashboardCots,
  getDashboardComplaints,
  getDashboardPaymentsDetail,
  getDashboardBookingsDetail,
  getDashboardCotsDetail,
  getDashboardComplaintsDetail,
} = require("../controllers/dashboard.controller");

router.get(constants.path.getDashboardPayments,verifyToken,getDashboardPayments);
router.get(constants.path.getDashboardBookings,verifyToken,getDashboardBookings);
router.get(constants.path.getDashboardCots, verifyToken, getDashboardCots);
router.get(constants.path.getDashboardComplaints,verifyToken,getDashboardComplaints);
router.get(constants.path.getDashboardPaymentsDetail,  verifyToken,getDashboardPaymentsDetail);
router.get(constants.path.getDashboardBookingsDetail, verifyToken, getDashboardBookingsDetail);
router.get(constants.path.getDashboardCotsDetail, verifyToken, getDashboardCotsDetail);
router.get(constants.path.getDashboardComplaintsDetail, verifyToken,  getDashboardComplaintsDetail)

module.exports = router;
