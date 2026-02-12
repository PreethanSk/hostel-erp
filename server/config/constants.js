"use strict";

const base = "/api/";
exports.path = {
  home: base,
  userLogin: base + "user-login",
  userLogOut: base + "user-logout",
  userSendOtp: base + "user-send-otp",
  userVerifyOtp: base + "user-verify-otp",
  userRegister: base + "user-register",

  // Master
  getMasterCountry: base + 'get-master-country',
  getMasterState: base + 'get-master-state',
  getMasterCity: base + 'get-master-city',
  insertUpdateMasterCountry: base + 'insert-update-master-country',
  insertUpdateMasterState: base + 'insert-update-master-state',
  insertUpdateMasterCity: base + 'insert-update-master-city',
  getMasterAmenitiesCategory: base + 'get-master-amenities-category',
  getMasterAmenitiesSubCategory: base + 'get-master-amenities-sub-category',
  getMasterAmenitiesFacilities: base + 'get-master-amenities-facilities',
  getMasterRoomType: base + 'get-master-room-type',
  getMasterBathroomType: base + 'get-master-bathroom-type',
  getMasterCotType: base + 'get-master-cot-type',
  getMasterSharingType: base + 'get-master-sharing-type',
  getMasterIssueCategory: base + 'get-master-issue-category',
  getMasterIssueSubCategory: base + 'get-master-issue-sub-category',
  getMasterPageList: base + 'get-master-page-list',
  getMasterUserRole: base + 'get-master-user-role',
  getRolePageAccess: base + 'get-role-page-access',
  getRolePageAccessByRoleId: base + 'get-role-page-access-by-role-id',
  getVacates: base + 'get-vacate',

  deleteMasterAmenitiesCategory: base + "delete-master-amenities-category",
  deleteMasterAmenitiesSubCategory: base + "delete-master-amenities-sub-category",
  deleteMasterAmenitiesFacility: base + "delete-master-amenities-facility",
  deleteMasterRoomType: base + "delete-master-room-type",
  deleteMasterBathroomType: base + "delete-master-bathroom-type",
  deleteMasterCotType: base + "delete-master-cot-type",
  deleteMasterSharingType: base + "delete-master-sharing-type",
  deleteMasterIssueCategory: base + "delete-master-issue-category",
  deleteMasterIssueSubCategory: base + "delete-master-issue-sub-category",
  deleteMasterPageList: base + "delete-master-page-list",
  deleteMasterUserRole: base + "delete-master-user-role",

  insertUpdateMasterAmenitiesCategory: base + "insert-update-master-amenities-category",
  insertUpdateMasterAmenitiesSubCategory: base + "insert-update-master-amenities-sub-category",
  insertUpdateMasterAmenitiesFacilities: base + "insert-update-master-amenities-facilities",
  insertUpdateMasterRoomType: base + "insert-update-master-room-type",
  insertUpdateMasterBathroomType: base + "insert-update-master-bathroom-type",
  insertUpdateMasterCotType: base + "insert-update-master-cot-type",
  insertUpdateMasterSharingType: base + "insert-update-master-sharing-type",
  insertUpdateMasterIssueCategory: base + "insert-update-master-issue-category",
  insertUpdateMasterIssueSubCategory: base + "insert-update-master-issue-sub-category",
  insertUpdateMasterPageList: base + "insert-update-master-page-list",
  insertUpdateMasterUserRole: base + "insert-update-master-user-role",
  insertUpdateRolePageAccess: base + "insert-update-role-page-access",

  // Branch
  getBranchDetailBySearch: base + "get-branch-candidate-by-search",
  getBranchRoomCotAvailabilityById: base + "get-branch-room-cot-availability",
  getCotsByCotId: base + "get-cots-by-cot-id",
  getBranchDetailsById: base + "get-branch-detail-by-id",
  getBranchPhoto: base + "get-branch-photo",
  getRoomByBranchId: base + "get-rooms-by-branch-id",
  getCotsByRoomId: base + "get-cots-by-room-id",
  getBranchAmenitiesDetails: base + "get-branch-amenities-details",
  insertUpdateBranchDetail: base + "insert-update-branch-detail",
  insertUpdateBranchAnyDetail: base + "insert-update-branch-any-detail",
  insertUpdateBranchPhoto: base + "insert-update-branch-photo",
  insertUpdateRoom: base + "insert-update-room",
  insertUpdateCot: base + "insert-update-cot",
  bulkUploadCots: base + "bulk-upload-cots",
  bulkUploadRooms: base + "bulk-upload-rooms",
  bulkUploadUsers: base + "bulk-upload-users",
  insertUpdateBranchAmenities: base + "insert-update-branch-amenities",

  // Candidate
  getCandidateAdmissionsById: base + "get-candidate-admissions-by-id",
  getCandidateAdmissions: base + "get-candidate-admissions",
  getCandidateDetail: base + "get-candidate-detail",
  getCandidateDetailBySearch: base + "get-candidate-details-by-search",
  getCandidateDocument: base + "get-candidate-document",
  getCandidateContactPersonDetail: base + "get-candidate-contact-person-detail",
  getCandidatePurposeOfStays: base + "get-candidate-purpose-of-stay",
  getCandidateOtherDetail: base + "get-candidate-other-detail",
  getCandidatePaymentDetail: base + "get-candidate-payment-detail",
  getAttendanceGridList: base + "get-attendance-grid-list",
  insertUpdateCandidateDetail: base + "insert-update-candidate-detail",
  insertUpdateCandidateAnyDetails: base + "insert-update-candidate-any-details",
  bulkUploadCandidateDetails: base + "bulk-upload-candidate-details",
  insertUpdateCandidateDocument: base + "insert-update-candidate-document",
  insertUpdateCandidateContactPersonDetail: base + "insert-update-candidate-contact-person-detail",
  insertUpdateCandidatePurposeOfStays: base + "insert-update-candidate-purpose-of-stay",
  insertUpdateCandidateOtherDetail: base + "insert-update-candidate-other-detail",
  insertUpdateCandidatePaymentDetail: base + "insert-update-candidate-payment-detail",
  insertUpdateCandidatePaymentAnyDetails: base + "insert-update-candidate-payment-any-details",
  insertUpdateCandidateAdmissions: base + "insert-update-candidate-admissions",
  insertUpdateCandidateAdmissionAnyDetails: base + "insert-update-candidate-admission-any-detail",
  insertUpdateCandidateBlackList: base + "insert-update-candidate-black-list",
  insertUpdateAttendanceDetails: base + "insert-update-attendance-details",
  validateMobileUniqueness: base + "validate-mobile-uniqueness",
  validateEmailUniqueness: base + "validate-email-uniqueness",
  deleteCandidateAdmission: base + "delete-candidate-admission",

  // Payment Schedule
  insertUpdatePaymentSchedule: base + "insert-update-payment-schedule",
  getPaymentScheduleById: base + "get-payment-schedule-by-id",
  generateCandidatePaymentSchedules: base + "generate-candidate-payment-schedules",
  getPaymentScheduleGridList: base + "get-payment-schedule-grid-list",
  getPaymentGridList: base + "get-payment-grid-list",

  // Complaints
  insertUpdateComplaints: base + "insert-update-complaints",
  getComplaintsDetailById: base + "get-complaints-details-by-id",
  getComplaintsByStatus: base + "get-complaints-by-status",
  updateComplaintStatus: base + "update-complaint-status",

  // Vacate
  getVacateById: base + "get-vacate-by-id",
  getVacateByBranch: base + "get-vacate-by-branch",
  getVacateByBranchDropdown: base + "get-vacate-by-branch-dropdown",
  getVacateByCandidateId: base + "get-vacate-by-candidate-id",
  insertUpdateVacates: base + "insert-update-vacate",
  bulkUploadVacate: base + "bulk-upload-vacate",
  deleteVacate: base + "delete-vacate",

  // Feedback
  insertUpdateCandidateFeedback: base + "insert-update-candidate-feedback",
  getCandidateFeedbackById: base + "get-candidate-feedback-by-id",

  // Grid List
  getComplaintsGridList: base + "get-complaints-grid-list",
  getRoomsGridList: base + "get-rooms-grid-list",
  getFeedbackGridList: base + "get-candidate-feedback-grid-list",
  getBlackListGridList: base + "get-blacklist-grid-list",
  getAdmissionGridList: base + "get-admission-grid-list",
  getEbChargesGridList: base + "get-eb-charges-grid-list",
  getApprovedAdmissionGridList: base + "get-approved-admission-grid-list",
  getVacateGridList: base + "get-vacate-grid-list",
  getBranchGridList: base + "get-branch-grid-list",
  getUserGridList: base + "get-user-grid-list",

  // dashboard api
  getDashboardPayments: base + "get-dashboard-payments",
  getDashboardBookings: base + "get-dashboard-bookings",
  getDashboardCots: base + "get-dashboard-cots",
  getDashboardComplaints: base + "get-dashboard-complaints",
  getDashboardPaymentsDetail: base + "get-dashboard-payments-detail",
  getDashboardBookingsDetail: base + "get-dashboard-bookings-detail",
  getDashboardCotsDetail: base + "get-dashboard-cots-detail",
  getDashboardComplaintsDetail: base + "get-dashboard-complaints-detail",

  // Check booking availability
  getAdmissionBookingAvailability: base + "get-admission-booking-availability",

  // Candidate Login-Signup
  candidateOtp: base + "generate-candidate-otp",
  candidateVerifyOtp: base + "verify-candidate-otp",
  candidateDeactivate: base + "candidate-deactivate",
  insertUpdateCandidateRegister: base + "insert-update-candidate-register",

  uploadFile: base + "upload-file",
  downloadFile: base + "download-file",

  // Payment-gateway
  getPaymentPage: base + "get-payment-page",
  getPaymentSuccess: base + "success_payment",
  updatePaymentStatus: base + "update-payment-status",

  //notification
  insertUpdateApprovedNotifications: base + "insert-update-approved-notification",
  getApprovedNotifications: base + "get-approved-notification",

  // Invoice
  getCandidateTransactionList: base + "get-candidate-transaction-list",
  sendInvoice: base + "send-invoice",
  generateInvoicePDF: base + "generate-invoice-pdf",

  // Service Provider and Category
  getServiceProvider: base + "get-service-provider",
  getServiceProviderCategory: base + "get-service-provider-category",
  insertUpdateServiceProviderCategory: base + "insert-update-service-provider-category",
  insertUpdateServiceProvider: base + "insert-update-service-provider",
  generateServiceProviderOtp: base + "generate-service-provider-otp",
  verifyServiceProviderOtp: base + "verify-service-provider-otp",
};
