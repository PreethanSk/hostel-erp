const express = require('express');
const router = express.Router();
const constants = require('../config/constants');
const { verifyToken } = require('../middleware/verifyAuth.middle');
const { insertUpdateBranchDetails, insertUpdateBranchPhotos, getBranchPhotos, insertUpdateRooms, insertUpdateCots, getBranchGridList, getRoomsGridList, getBranchAmenitiesDetails, getCotsByRoomId, getRoomByBranchId, insertUpdateBranchAmenities, insertUpdateBranchAnyDetails, getBranchDetailsById, getBranchRoomCotAvailabilityById, getCotsByCotId, getBranchDetailBySearch, bulkUploadCots, bulkUploadRooms } = require('../controllers/branchDetails.controller');


router.get(constants.path.getBranchDetailBySearch, verifyToken, getBranchDetailBySearch);
router.get(constants.path.getBranchGridList, verifyToken, getBranchGridList);
router.get(constants.path.getBranchRoomCotAvailabilityById, verifyToken, getBranchRoomCotAvailabilityById);
router.get(constants.path.getBranchDetailsById, verifyToken, getBranchDetailsById);
router.post(constants.path.insertUpdateBranchDetail, verifyToken, insertUpdateBranchDetails);
router.post(constants.path.insertUpdateBranchAnyDetail, verifyToken, insertUpdateBranchAnyDetails);
router.get(constants.path.getBranchPhoto, verifyToken, getBranchPhotos)
router.get(constants.path.getRoomByBranchId, verifyToken, getRoomByBranchId)
router.get(constants.path.getCotsByRoomId, verifyToken, getCotsByRoomId)
router.get(constants.path.getCotsByCotId, verifyToken, getCotsByCotId)
router.get(constants.path.getRoomsGridList, verifyToken, getRoomsGridList)
router.get(constants.path.getBranchAmenitiesDetails, verifyToken, getBranchAmenitiesDetails)
router.post(constants.path.insertUpdateBranchAmenities, verifyToken, insertUpdateBranchAmenities)
router.post(constants.path.insertUpdateBranchPhoto, verifyToken, insertUpdateBranchPhotos)
router.post(constants.path.insertUpdateRoom, verifyToken, insertUpdateRooms)
router.post(constants.path.insertUpdateCot, verifyToken, insertUpdateCots)
router.post(constants.path.bulkUploadCots, verifyToken, bulkUploadCots)
router.post(constants.path.bulkUploadRooms, verifyToken, bulkUploadRooms)

module.exports = router