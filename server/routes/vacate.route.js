const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { getVacateById, insertUpdateVacate, getVacateGridList, getVacateByBranch, getVacateBranchDropdown, deleteVacate, getVacateByCandidateId, bulkUploadVacate } = require('../controllers/vacate.controller');


router.get(constants.path.getVacateGridList, verifyToken, getVacateGridList)
router.get(constants.path.getVacateById, verifyToken, getVacateById)
router.get(constants.path.getVacateByCandidateId, verifyToken, getVacateByCandidateId)
router.get(constants.path.getVacateByBranch, verifyToken, getVacateByBranch)
router.get(constants.path.getVacateByBranchDropdown, verifyToken, getVacateBranchDropdown)
router.post(constants.path.insertUpdateVacates, verifyToken, insertUpdateVacate)
router.post(constants.path.bulkUploadVacate, verifyToken, bulkUploadVacate)
router.delete(constants.path.deleteVacate, verifyToken, deleteVacate)


module.exports = router