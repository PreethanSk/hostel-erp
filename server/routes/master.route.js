const express = require("express");
const router = express.Router();
const constants = require("../config/constants");
const { verifyToken } = require("../middleware/verifyAuth.middle");
const {
  getMasterAmenitiesCategories,
  getMasterAmenitiesSubCategories,
  getMasterAmenitiesFacilities,
  insertUpdateMasterAmenitiesCategories,
  insertUpdateMasterAmenitiesSubCategories,
  insertUpdateMasterAmenitiesFacilities,
  insertUpdateMasterRoomTypes,
  getMasterRoomTypes,
  insertUpdateMasterBathroomTypes,
  getMasterBathroomTypes,
  insertUpdateMasterCotTypes,
  getMasterCotTypes,
  insertUpdateMasterSharingTypes,
  getMasterSharingTypes,
  insertUpdateMasterIssueCategories,
  getMasterIssueCategories,
  insertUpdateMasterIssueSubCategories,
  getMasterIssueSubCategories,
  insertUpdateMasterPageLists,
  getMasterPageLists,
  insertUpdateMasterUserRoles,
  getMasterUserRoles,
  deleteMasterAmenitiesCategory,
  deleteMasterAmenitiesSubCategory,
  deleteMasterAmenitiesFacility,
  deleteMasterRoomType,
  deleteMasterBathroomType,
  deleteMasterCotType,
  deleteMasterSharingType,
  deleteMasterIssueCategory,
  deleteMasterIssueSubCategory,
  deleteMasterPageList,
  deleteMasterUserRole
} = require("../controllers/master.controller");
const {
  getMasterCountry,
  getMasterState,
  getMasterCity,
  insertUpdateMasterCountry,
  insertUpdateMasterState,
  insertUpdateMasterCity,
} = require("../controllers/countryStateCity.controller");

router.get(constants.path.getMasterCountry, getMasterCountry);
router.get(constants.path.getMasterState, getMasterState);
router.get(constants.path.getMasterCity, getMasterCity);
router.post(constants.path.insertUpdateMasterCountry, insertUpdateMasterCountry);
router.post(constants.path.insertUpdateMasterState, insertUpdateMasterState);
router.post(constants.path.insertUpdateMasterCity, insertUpdateMasterCity);
router.get(constants.path.getMasterAmenitiesCategory, verifyToken, getMasterAmenitiesCategories);
router.get(constants.path.getMasterAmenitiesSubCategory, verifyToken, getMasterAmenitiesSubCategories);
router.get(constants.path.getMasterAmenitiesFacilities, verifyToken, getMasterAmenitiesFacilities);
router.get(constants.path.getMasterRoomType, verifyToken, getMasterRoomTypes);
router.get(constants.path.getMasterBathroomType, verifyToken, getMasterBathroomTypes);
router.get(constants.path.getMasterCotType, verifyToken, getMasterCotTypes);
router.get(constants.path.getMasterSharingType, verifyToken, getMasterSharingTypes);
router.get(constants.path.getMasterIssueCategory, verifyToken, getMasterIssueCategories);
router.get(constants.path.getMasterIssueSubCategory, verifyToken, getMasterIssueSubCategories);
router.get(constants.path.getMasterPageList, verifyToken, getMasterPageLists);
router.get(constants.path.getMasterUserRole, getMasterUserRoles);
router.post(constants.path.insertUpdateMasterAmenitiesCategory, verifyToken, insertUpdateMasterAmenitiesCategories);
router.post(constants.path.insertUpdateMasterAmenitiesSubCategory, verifyToken, insertUpdateMasterAmenitiesSubCategories);
router.post(constants.path.insertUpdateMasterAmenitiesFacilities, verifyToken, insertUpdateMasterAmenitiesFacilities);
router.post(constants.path.insertUpdateMasterRoomType, verifyToken, insertUpdateMasterRoomTypes);
router.post(constants.path.insertUpdateMasterBathroomType, verifyToken, insertUpdateMasterBathroomTypes);
router.post(constants.path.insertUpdateMasterCotType, verifyToken, insertUpdateMasterCotTypes);
router.post(constants.path.insertUpdateMasterSharingType, verifyToken, insertUpdateMasterSharingTypes);
router.post(constants.path.insertUpdateMasterIssueCategory, verifyToken, insertUpdateMasterIssueCategories);
router.post(constants.path.insertUpdateMasterIssueSubCategory, verifyToken, insertUpdateMasterIssueSubCategories);
router.post(constants.path.insertUpdateMasterPageList, verifyToken, insertUpdateMasterPageLists);
router.post(constants.path.insertUpdateMasterUserRole, insertUpdateMasterUserRoles);

router.delete(constants.path.deleteMasterAmenitiesCategory, verifyToken, deleteMasterAmenitiesCategory)
router.delete(constants.path.deleteMasterAmenitiesSubCategory, verifyToken, deleteMasterAmenitiesSubCategory);
router.delete(constants.path.deleteMasterAmenitiesFacility, verifyToken, deleteMasterAmenitiesFacility);
router.delete(constants.path.deleteMasterRoomType, verifyToken, deleteMasterRoomType);
router.delete(constants.path.deleteMasterBathroomType, verifyToken, deleteMasterBathroomType);
router.delete(constants.path.deleteMasterCotType, verifyToken, deleteMasterCotType);
router.delete(constants.path.deleteMasterSharingType, verifyToken, deleteMasterSharingType);
router.delete(constants.path.deleteMasterIssueCategory, verifyToken, deleteMasterIssueCategory);
router.delete(constants.path.deleteMasterIssueSubCategory, verifyToken, deleteMasterIssueSubCategory);
router.delete(constants.path.deleteMasterPageList, verifyToken, deleteMasterPageList);
router.delete(constants.path.deleteMasterUserRole, verifyToken, deleteMasterUserRole);

module.exports = router;
