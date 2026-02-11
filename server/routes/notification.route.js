const express = require("express");
const router = express.Router();
const constants = require("../config/constants");
const { verifyToken } = require("../middleware/verifyAuth.middle");
const { insertUpdateApprovedNotification, getApprovedNotification } = require("../controllers/notification.controller");

router.post(constants.path.insertUpdateApprovedNotifications, verifyToken, insertUpdateApprovedNotification);
router.get(constants.path.getApprovedNotifications, verifyToken, getApprovedNotification);

module.exports = router;