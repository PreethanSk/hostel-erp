const express = require('express');
const router = express.Router();
const constants = require('../config/constants');


const { verifyToken } = require('../middleware/verifyAuth.middle');
const { insertUpdateCandidateDetails, getCandidateDetails, insertUpdateCandidateDocuments, getCandidateDocuments, insertUpdateCandidateContactPersonDetails,
    getCandidateContactPersonDetails, insertUpdateCandidatePurposeOfStay, getCandidatePurposeOfStay, insertUpdateCandidateOtherDetails,
    getCandidateOtherDetails, insertUpdateCandidateAdmissions, getCandidateAdmission, getAdmissionGridList,
    getFeedbackGridList, getBlackListGridList, getCandidateDetailBySearch, insertUpdateCandidateAnyDetails,
    insertUpdateCandidateFeedback, insertUpdateCandidateDetailsMobile, insertUpdateAttendanceDetails, getAttendanceGridList,
    getCandidatePaymentDetails, insertUpdateCandidatePaymentDetails, insertUpdateCandidateBlackListDetails,
    getCandidateAdmissionById,
    getCandidateFeedbackById,
    insertUpdateCandidateAdmissionAnyDetails, 
    getAdmissionBookingAvailability,
    getApprovedAdmissionGridList,
    validateCandidateMobileNumberUniqueness,
    validateCandidateEmailUniqueness,
    getEbChargesGridList,
    insertUpdateCandidatePaymentAnyDetails,
    deleteCandidateAdmission,
    bulkUploadCandidateDetails,} = require('../controllers/candidateDetails.controller');

router.get(constants.path.getCandidateDetail, verifyToken, getCandidateDetails);
router.get(constants.path.getCandidateDetailBySearch, verifyToken, getCandidateDetailBySearch);
router.get(constants.path.getCandidateDocument, verifyToken, getCandidateDocuments)
router.get(constants.path.getCandidateContactPersonDetail, verifyToken, getCandidateContactPersonDetails)
router.get(constants.path.getCandidatePurposeOfStays, verifyToken, getCandidatePurposeOfStay)
router.get(constants.path.getCandidateOtherDetail, verifyToken, getCandidateOtherDetails)
router.get(constants.path.getCandidatePaymentDetail, verifyToken, getCandidatePaymentDetails)
router.get(constants.path.getCandidateAdmissions, verifyToken, getCandidateAdmission)
router.get(constants.path.getAdmissionGridList, verifyToken, getAdmissionGridList)
router.get(constants.path.getEbChargesGridList, verifyToken, getEbChargesGridList)
router.get(constants.path.getApprovedAdmissionGridList, verifyToken, getApprovedAdmissionGridList)
router.get(constants.path.getFeedbackGridList, verifyToken, getFeedbackGridList)
router.get(constants.path.getBlackListGridList, verifyToken, getBlackListGridList)
router.get(constants.path.getAttendanceGridList, verifyToken, getAttendanceGridList)
router.get(constants.path.getCandidateAdmissionsById, verifyToken, getCandidateAdmissionById)
router.get(constants.path.getCandidateFeedbackById, verifyToken, getCandidateFeedbackById)
router.get(constants.path.getAdmissionBookingAvailability, verifyToken, getAdmissionBookingAvailability)
router.get(constants.path.deleteCandidateAdmission, verifyToken, deleteCandidateAdmission)

router.post(constants.path.insertUpdateCandidateRegister, insertUpdateCandidateDetailsMobile)
router.post(constants.path.insertUpdateCandidateDetail, verifyToken, insertUpdateCandidateDetails)
router.post(constants.path.insertUpdateCandidateAnyDetails, verifyToken, insertUpdateCandidateAnyDetails)
router.post(constants.path.insertUpdateCandidateDocument, verifyToken, insertUpdateCandidateDocuments)
router.post(constants.path.insertUpdateCandidateContactPersonDetail, verifyToken, insertUpdateCandidateContactPersonDetails)
router.post(constants.path.insertUpdateCandidatePurposeOfStays, verifyToken, insertUpdateCandidatePurposeOfStay)
router.post(constants.path.insertUpdateCandidateOtherDetail, verifyToken, insertUpdateCandidateOtherDetails)
router.post(constants.path.insertUpdateCandidatePaymentDetail, verifyToken, insertUpdateCandidatePaymentDetails)
router.post(constants.path.insertUpdateCandidatePaymentAnyDetails, verifyToken, insertUpdateCandidatePaymentAnyDetails)
router.post(constants.path.insertUpdateCandidateAdmissions, verifyToken, insertUpdateCandidateAdmissions)
router.post(constants.path.insertUpdateCandidateAdmissionAnyDetails, verifyToken, insertUpdateCandidateAdmissionAnyDetails)
router.post(constants.path.insertUpdateCandidateFeedback, verifyToken, insertUpdateCandidateFeedback)
router.post(constants.path.insertUpdateCandidateBlackList, verifyToken, insertUpdateCandidateBlackListDetails)
router.post(constants.path.insertUpdateAttendanceDetails, verifyToken, insertUpdateAttendanceDetails)
router.post(constants.path.validateMobileUniqueness, verifyToken, validateCandidateMobileNumberUniqueness)
router.post(constants.path.validateEmailUniqueness, verifyToken, validateCandidateEmailUniqueness)
router.post(constants.path.bulkUploadCandidateDetails, verifyToken, bulkUploadCandidateDetails)

module.exports = router

