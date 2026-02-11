"use strict";

const { Sequelize } = require("sequelize");
const db = {};
const dbConfig = global.config.database;
const api = dbConfig.serviceApi || dbConfig.serviceAPI;

const sequelize = new Sequelize(
  api.db,
  api.name,
  api.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    logging: dbConfig.logging,
    dialectOptions: {
      connectTimeout: 60000,
    },
    timezone: "+00:00",
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 30000,
      handleDisconnects: true
    },
    retry: {
      max: 3,
      timeout: 10000
    }
  }
);

db.MasterCountry = require("./masterCountry.model")(sequelize);
db.MasterState = require("./masterState.model")(sequelize);
db.MasterCity = require("./masterCity.model")(sequelize);
db.Users = require("./users.model")(sequelize);
db.UserSessions = require("./userSession.model")(sequelize);
db.UserOtp = require("./userOtp.model")(sequelize);
db.MasterAmenitiesCategories = require("./masterAmenitiesCategories.model")(sequelize);
db.MasterAmenitiesSubCategories = require("./masterAmenitiesSubCategories.model")(sequelize);
db.MasterAmenitiesFacilities = require("./masterAmenitiesFacilities.model")(sequelize);
db.MasterIssueCategories = require("./masterIssueCategories.model")(sequelize);
db.MasterIssueSubCategories = require("./masterIssueSubCategories.model")(sequelize);
db.MasterBathroomType = require("./masterBathroomType.model")(sequelize);
db.MasterRoomTypes = require("./masterRoomTypes.model")(sequelize);
db.MasterSharingTypes = require("./masterSharingTypes.model")(sequelize);
db.MasterPageList = require("./masterPageList.model")(sequelize);
db.MasterUserRoles = require("./masterUserRoles.model")(sequelize);
db.MasterCotTypes = require("./masterCotTypes.model")(sequelize);

db.RolePageAccess = require("./rolePageAccess.model")(sequelize);
db.Rooms = require("./rooms.model")(sequelize);
db.Cots = require("./cots.model")(sequelize);
db.Feedback = require("./feedback.model")(sequelize);
db.Vacate = require("./vacate.model")(sequelize);
db.BranchDetails = require("./branchDetails.model")(sequelize);
db.BranchPhotos = require("./branchPhotos.model")(sequelize);
db.CandidateDetails = require("./candidateDetails.model")(sequelize);
db.CandidateAdmission = require("./candidateAdmission.model")(sequelize);
db.CandidateContactPersonDetails = require("./candidateContactPersonDetails.model")(sequelize);
db.CandidateDocumentDetails = require("./candidateDocumentDetails.model")(sequelize);
db.CandidateOtherDetails = require("./candidateOtherDetails.model")(sequelize);
db.CandidatePurposeOfStay = require("./candidatePurposeOfStay.model")(sequelize);
db.CandidatePaymentDetails = require("./candidatePaymentDetails.model")(sequelize);
db.CandidatePaymentSchedule = require("./candidatePaymentSchedule.model")(sequelize);
db.Complaints = require("./complaints.model")(sequelize);
db.BranchAmenitiesDetails = require("./branchAmenitiesDetails.model")(sequelize);
db.AttendanceDetails = require("./attendanceDetails.model")(sequelize);
db.MasterIssuesSubCategories = require("./masterIssueSubCategories.model")(sequelize);
db.approvedNotification = require("./approvedNotification.model")(sequelize);

db.ServiceProvider = require("./serviceProviders.model")(sequelize);
db.ServiceProviderCategory = require("./serviceProviderCategory.model")(sequelize);
db.ServiceProviderOtp = require("./serviceProvidersOtp.model")(sequelize);

// ****** Relations *******
db.MasterAmenitiesCategories.hasMany(db.MasterAmenitiesSubCategories, { foreignKey: "categoryId", as: "MasterAmenitiesCategories", });
db.MasterAmenitiesSubCategories.belongsTo(db.MasterAmenitiesCategories, { foreignKey: "categoryId", as: "MasterAmenitiesCategories", });

db.Users.hasMany(db.UserSessions, { foreignKey: "userId", as: "Users" });
db.UserSessions.belongsTo(db.Users, { foreignKey: "userId", as: "Users" });

db.MasterUserRoles.hasMany(db.Users, { foreignKey: "userRoleId", as: "Users", });
db.Users.belongsTo(db.MasterUserRoles, { foreignKey: "userRoleId", as: "MasterUserRoles", });
db.BranchDetails.hasMany(db.Users, { foreignKey: "branchId", as: "Users", });
db.Users.belongsTo(db.BranchDetails, { foreignKey: "branchId", as: "BranchDetails", });

db.MasterUserRoles.hasMany(db.RolePageAccess, { foreignKey: "roleId", as: "RolePageAccess", });
db.RolePageAccess.belongsTo(db.MasterUserRoles, { foreignKey: "roleId", as: "MasterUserRoles", });

db.MasterAmenitiesSubCategories.hasMany(db.MasterAmenitiesFacilities, { foreignKey: "subCategoryId", as: "MasterAmenitiesSubCategories", });
db.MasterAmenitiesFacilities.belongsTo(db.MasterAmenitiesSubCategories, { foreignKey: "subCategoryId", as: "MasterAmenitiesSubCategories", });

db.MasterIssueCategories.hasMany(db.MasterIssueSubCategories, { foreignKey: "issueId", as: "MasterIssueCategories", });
db.MasterIssueSubCategories.belongsTo(db.MasterIssueCategories, { foreignKey: "issueId", as: "MasterIssueCategories", });

db.MasterPageList.hasMany(db.RolePageAccess, { foreignKey: "pageId", as: "MasterPageList", });
db.RolePageAccess.belongsTo(db.MasterPageList, { foreignKey: "pageId", as: "MasterPageList", });

db.CandidateDetails.hasMany(db.CandidateOtherDetails, { foreignKey: "candidateRefId", as: "CandidateOtherDetails", });
db.CandidateOtherDetails.belongsTo(db.CandidateDetails, { foreignKey: "candidateRefId", as: "CandidateOtherDetails", });

db.BranchDetails.hasMany(db.BranchPhotos, { foreignKey: "branchId", as: "BranchPhotos", });
db.BranchPhotos.belongsTo(db.BranchDetails, { foreignKey: "branchId", as: "BranchPhotos", });

db.BranchDetails.hasMany(db.Rooms, { foreignKey: "branchId", as: "branchRooms" });
db.Rooms.belongsTo(db.BranchDetails, { foreignKey: "branchId", as: "BranchDetails" });

db.MasterRoomTypes.hasMany(db.Rooms, { foreignKey: "roomTypeId", as: "roomTypeRooms", });
db.Rooms.belongsTo(db.MasterRoomTypes, { foreignKey: "roomTypeId", as: "MasterRoomTypes", });

db.MasterSharingTypes.hasMany(db.Rooms, { foreignKey: "sharingTypeId", as: "sharingTypeRooms", });
db.Rooms.belongsTo(db.MasterSharingTypes, { foreignKey: "sharingTypeId", as: "MasterSharingTypes", });

db.Rooms.hasMany(db.Cots, { foreignKey: "roomId", as: "cotsRoom" });
db.Cots.belongsTo(db.Rooms, { foreignKey: "roomId", as: "Rooms" });
db.MasterCotTypes.hasMany(db.Cots, { foreignKey: "cotTypeId", as: "cotsType" });
db.Cots.belongsTo(db.MasterCotTypes, { foreignKey: "cotTypeId", as: "MasterCotTypes", });

db.CandidateDetails.hasMany(db.AttendanceDetails, { foreignKey: "candidateId", as: "candidateAttendance", });

db.Rooms.hasMany(db.CandidateAdmission, { foreignKey: "roomRefId", as: "CandidateAdmissionsInRoom" });
db.CandidateAdmission.belongsTo(db.Rooms, { foreignKey: "roomRefId", as: "RoomDetails" });
db.Cots.hasMany(db.CandidateAdmission, { foreignKey: "cotRefId", as: "CandidateAdmissionsInCot" });
db.CandidateAdmission.belongsTo(db.Cots, { foreignKey: "cotRefId", as: "CotDetails" });
db.BranchDetails.hasMany(db.CandidateAdmission, { foreignKey: "branchRefId", as: "CandidateAdmissionInBranch" });
db.CandidateAdmission.belongsTo(db.BranchDetails, { foreignKey: "branchRefId", as: "AdmissionBranchDetails" });
db.CandidateDetails.hasMany(db.CandidateAdmission, { foreignKey: "candidateRefId", as: "CandidateAdmissionInCandidateDetails" });
db.CandidateAdmission.belongsTo(db.CandidateDetails, { foreignKey: "candidateRefId", as: "CandidateAdmissionName" });

db.BranchDetails.hasMany(db.Feedback, { foreignKey: "branchRefId", as: "FeedbackCandidateBranch" });
db.Feedback.belongsTo(db.BranchDetails, { foreignKey: "branchRefId", as: "FeedbackCandidateBranchDetails" });
db.CandidateDetails.hasMany(db.Feedback, { foreignKey: "candidateRefId", as: "FeedbackCandidateDetails" });
db.Feedback.belongsTo(db.CandidateDetails, { foreignKey: "candidateRefId", as: "FeedbackCandidateName" });
db.CandidateAdmission.hasMany(db.Feedback, { foreignKey: "admissionRefId", as: "FeedbackCandidateAdmission" });
db.Feedback.belongsTo(db.CandidateAdmission, { foreignKey: "admissionRefId", as: "FeedbackCandidateAdmission" });

db.AttendanceDetails.belongsTo(db.CandidateDetails, { foreignKey: "candidateId", as: "candidate", });

db.BranchDetails.hasMany(db.Complaints, { foreignKey: "branchRefId", as: "branchComplaints", });
db.Complaints.belongsTo(db.BranchDetails, { foreignKey: "branchRefId", as: "BranchDetails", });

db.Rooms.hasMany(db.Complaints, { foreignKey: "roomRefId", as: "roomComplaints", });
db.Complaints.belongsTo(db.Rooms, { foreignKey: "roomRefId", as: "Rooms" });

db.Cots.hasMany(db.Complaints, { foreignKey: "cotRefId", as: "cotComplaints", });
db.Complaints.belongsTo(db.Cots, { foreignKey: "cotRefId", as: "ComplaintsCots" });

db.MasterIssueCategories.hasMany(db.Complaints, { foreignKey: "issueTypeRefId", as: "categoryComplaints", });
db.Complaints.belongsTo(db.MasterIssueCategories, { foreignKey: "issueTypeRefId", as: "MasterIssueCategories", });

db.MasterIssuesSubCategories.hasMany(db.Complaints, { foreignKey: "issueSubCategoryRefId", as: "subCategoryComplaints", });
db.Complaints.belongsTo(db.MasterIssuesSubCategories, { foreignKey: "issueSubCategoryRefId", as: "MasterIssuesSubCategories", });

db.CandidateDetails.hasMany(db.Complaints, { foreignKey: "raisedByCandidateId", as: "candidateComplaints", });
db.Complaints.belongsTo(db.CandidateDetails, { foreignKey: "raisedByCandidateId", as: "CandidateDetails", });

db.Users.hasMany(db.Complaints, { foreignKey: "raisedByManagerId", as: "complaintsUsers", });
db.Complaints.belongsTo(db.Users, { foreignKey: "raisedByManagerId", as: "ComplaintsUsers", });

db.Users.hasMany(db.Complaints, { foreignKey: "assignedToUserId", as: "assignedComplaintsUsers", });
db.Complaints.belongsTo(db.Users, { foreignKey: "assignedToUserId", as: "AssignedComplaintsUsers", });

db.Complaints.belongsTo(db.ServiceProvider, { foreignKey: "serviceProviderId", as: "serviceProviderComplaints", });
db.Complaints.belongsTo(db.ServiceProviderCategory, { foreignKey: "serviceCategoryId", as: "serviceCategoryComplaints", });
db.ServiceProvider.hasMany(db.Complaints, { foreignKey: "serviceProviderId", as: "serviceProviderComplaints", });
db.ServiceProviderCategory.hasMany(db.Complaints, { foreignKey: "serviceCategoryId", as: "serviceCategoryComplaints", });

db.ServiceProvider.hasMany(db.ServiceProviderOtp, { foreignKey: "serviceProviderId", as: "serviceProviderOtps", });
db.ServiceProviderOtp.belongsTo(db.ServiceProvider, { foreignKey: "serviceProviderId", as: "serviceProvider", });

db.CandidateDetails.hasMany(db.Vacate, { foreignKey: "candidateRefId", as: "CandidateDetails", });
db.Vacate.belongsTo(db.CandidateDetails, { foreignKey: "candidateRefId", as: "VacateCandidateDetails", });
db.BranchDetails.hasMany(db.Vacate, { foreignKey: "branchRefId", as: "BranchDetails", });
db.Vacate.belongsTo(db.BranchDetails, { foreignKey: "branchRefId", as: "VacateBranchDetails", });
db.CandidateAdmission.hasMany(db.Vacate, { foreignKey: "admissionRefId", as: "CandidateAdmission", });
db.Vacate.belongsTo(db.CandidateAdmission, { foreignKey: "admissionRefId", as: "VacateCandidateAdmission", });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
