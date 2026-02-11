const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { insertUpdateRolePageAccess, getRolePageAccess, getRolePageAccessByRoleId } = require('../controllers/rolePage.controller');


router.get(constants.path.getRolePageAccess, verifyToken, getRolePageAccess)
router.get(constants.path.getRolePageAccessByRoleId, verifyToken, getRolePageAccessByRoleId)
router.post(constants.path.insertUpdateRolePageAccess, verifyToken, insertUpdateRolePageAccess);

module.exports = router