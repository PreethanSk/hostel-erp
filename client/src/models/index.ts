import { ROUTES } from "../configs/constants";
import { httpDelete, httpGet, httpPost } from "../services/HttpService";

export const getLoginOtp = (keyUser: string, otpType: string) => {
  return httpGet(ROUTES.API.GET_LOGIN_OTP + `?keyUser=${keyUser}&otpType=${otpType}`);
};
export const verifyLoginOtp = (keyUser: string, otpType: string, otp: number) => {
  return httpGet(ROUTES.API.VERIFY_LOGIN_OTP + `?keyUser=${keyUser}&otpType=${otpType}&otp=${otp}`);
};
export const getMasterAmenitiesCategory = () => {
  return httpGet(ROUTES.API.GET_MASTER_AMENITIES_CATEGORY);
};
export const insertUpdateMasterAmenitiesCategory = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_AMENITIES_CATEGORY, formData);
};
export const getMasterAmenitiesSubCategory = () => {
  return httpGet(ROUTES.API.GET_MASTER_AMENITIES_SUB_CATEGORY);
};
export const insertUpdateMasterAmenitiesSubCategory = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_AMENITIES_SUB_CATEGORY, formData);
};
export const getMasterAmenitiesFacilities = () => {
  return httpGet(ROUTES.API.GET_MASTER_AMENITIES_SUB_FACILITIES);
};
export const insertUpdateMasterAmenitiesFacilities = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_AMENITIES_SUB_FACILITIES, formData);
};
export const insertUpdateMasterCotType = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_COT_TYPE, formData);
};
export const getMasterCotType = () => {
  return httpGet(ROUTES.API.GET_MASTER_COT_TYPE);
};
export const insertUpdateMasterRoomType = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_ROOM_TYPE, formData);
};
export const getMasterRoomType = () => {
  return httpGet(ROUTES.API.GET_MASTER_ROOM_TYPE);
};
export const insertUpdateMasterIssueCategory = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_ISSUE_CATEGORY, formData);
};
export const getMasterIssueCategory = () => {
  return httpGet(ROUTES.API.GET_MASTER_ISSUE_CATEGORY);
};
export const insertUpdateMasterBathroomType = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_BATHROOM_TYPE, formData);
};
export const getMasterBathroomType = () => {
  return httpGet(ROUTES.API.GET_MASTER_BATHROOM_TYPE);
};
export const insertUpdateMasterIssueSubCategory = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_ISSUE_SUB_CATEGORY, formData);
};
export const getMasterIssueSubCategory = () => {
  return httpGet(ROUTES.API.GET_MASTER_ISSUE_SUB_CATEGORY);
};
export const insertUpdateMasterPageList = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_PAGE_LIST, formData);
};
export const getMasterPageList = () => {
  return httpGet(ROUTES.API.GET_MASTER_PAGE_LIST);
};
export const insertUpdateMasterSharingType = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_SHARING_TYPE, formData);
};
export const getMasterSharingType = () => {
  return httpGet(ROUTES.API.GET_MASTER_SHARING_TYPE);
};
export const insertUpdateMasterUserRole = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_MASTER_USER_ROLE, formData);
};
export const getMasterUserRole = () => {
  return httpGet(ROUTES.API.GET_MASTER_USER_ROLE);
};

// Delete Master
export const deleteMasterAmenitiesCategory = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_AMENITIES_CATEGORY + `?id=${id}`);
};
export const deleteMasterAmenitiesSubCategory = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_AMENITIES_SUBCATEGORY + `?id=${id}`);
};
export const deleteMasterAmenitiesFacility = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_AMENITIES_FACILITY + `?id=${id}`);
};
export const deleteMasterRoomType = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_ROOM_TYPE + `?id=${id}`);
};
export const deleteMasterBathroomType = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_BATHROOM_TYPE + `?id=${id}`);
};
export const deleteMasterCotType = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_COT_TYPE + `?id=${id}`);
};
export const deleteMasterSharingType = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_SHARING_TYPE + `?id=${id}`);
};
export const deleteMasterIssueCategory = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_ISSUE_CATEGORY + `?id=${id}`);
};
export const deleteMasterIssueSubCategory = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_ISSUE_SUB_CATEGORY + `?id=${id}`);
};
export const deleteMasterPageList = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_PAGE_LIST + `?id=${id}`);
};
export const deleteMasterUserRole = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_MASTER_USER_ROLE + `?id=${id}`);
};

// Admissions
export const getApprovedAdmissionGridList = (page: number = 1, size: number = 0, branchId: string = "", fromDate: string = "", toDate: string = "", paymentStatus: string = "") => {
  return httpGet(ROUTES.API.GET_APPROVED_ADMISSION_GRID_LIST + `?page=${page}&size=${size ? size : ""}&branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}&paymentStatus=${paymentStatus}`);
};
export const getAdmissionGridList = (page: number = 1, size: number = 0, branchId: string = "", fromDate: string = "", toDate: string = "") => {
  return httpGet(ROUTES.API.GET_ADMISSION_GRID_LIST + `?page=${page}&size=${size ? size : ""}&branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}`);
};
export const getAdmissionEbChargesGridList = (page: number = 1, size: number = 0, branchId: string = "", roomType: string = "", fromDate: string = "", toDate: string = "") => {
  return httpGet(ROUTES.API.GET_EB_CHARGES_GRID_LIST + `?page=${page}&size=${size ? size : ""}&branchId=${branchId}&roomType=${roomType}&fromDate=${fromDate}&toDate=${toDate}`);
};
export const insertUpdateCandidateDetails = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_DETAIL, formData);
};
export const bulkUploadCandidateDetails = (formData: any) => {
  return httpPost(ROUTES.API.BULK_UPLOAD_CANDIDATE_DETAILS, formData);
};
export const bulkUploadCots = (formData: any) => {
  return httpPost(ROUTES.API.BULK_UPLOAD_COTS, formData);
};
export const bulkUploadRooms = (formData: any) => {
  return httpPost(ROUTES.API.BULK_UPLOAD_ROOMS, formData);
};
export const bulkUploadVacate = (formData: any) => {
  return httpPost(ROUTES.API.BULK_UPLOAD_VACATE, formData);
};
export const bulkUploadUsers = (formData: any) => {
  return httpPost(ROUTES.API.BULK_UPLOAD_USERS, formData);
};
export const insertUpdateCandidateDocuments = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_DOCUMENT, formData);
};
export const insertUpdateCandidateContactPerson = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_CONTACT_PERSON_DETAIL, formData);
};
export const insertUpdateCandidatePurposeOfStay = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_PURPOSE_OF_STAY, formData);
};
export const insertUpdateCandidateOtherDetail = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_OTHER_DETAIL, formData);
};
export const insertUpdateCandidatePaymentDetail = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_PAYMENT_DETAIL, formData);
};
export const insertUpdateCandidatePaymentAnyDetails = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_PAYMENT_ANY_DETAILS, formData);
};
export const insertUpdateCandidateAdmissionAnyDetail = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_ADMISSION_ANY_DETAIL, formData);
};
export const insertUpdateCandidateAdmission = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_ADMISSION_CANDIDATE_ADMISSION, formData);
};
export const deleteCandidateAdmission = (id: number) => {
  return httpGet(ROUTES.API.DELETE_CANDIDATE_ADMISSION + `?admissionId=${id}`);
};
export const insertUpdateCandidateAnyDetail = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_ANY_DETAIL, formData);
};
export const getCandidateDetail = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_DETAIL + `?candidateId=${id}`);
};
export const getCandidateDocument = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_DOCUMENT + `?candidateId=${id}`);
};
export const getCandidateContactPerson = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_CONTACT_PERSON_DETAIL + `?candidateId=${id}`);
};
export const getCandidatePurposeOfStay = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_PURPOSE_OF_STAY + `?candidateId=${id}`);
};
export const getCandidateOtherDetail = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_OTHER_DETAIL + `?candidateId=${id}`);
};
export const getCandidatePaymentDetail = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_PAYMENT_DETAIL + `?candidateId=${id}`);
};
export const getCandidateAdmission = (id: number) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_ADMISSION + `?candidateId=${id}`);
};
export const getCandidateAdmissionById = (formData: any) => {
  return httpGet(
    ROUTES.API.GET_CANDIDATE_ADMISSION_BY_ID +
    `?candidateId=${formData?.candidateId || ""}&branchId=${formData?.branchId || ""
    }&admissionId=${formData?.admissionId || ""}&cotId=${formData?.cotId || ""
    }`
  );
};
export const getAdmissionBookingAvailability = (formData: any) => {
  return httpGet(
    ROUTES.API.GET_ADMISSION_BOOKING_AVAILABILITY +
    `?roomId=${formData?.roomId || ""}&branchId=${formData?.branchId || ""
    }&dateOfAdmission=${formData?.dateOfAdmission || ""}&cotId=${formData?.cotId || ""
    }`
  );
};
export const getCandidateDetailSearch = (search: string) => {
  return httpGet(ROUTES.API.GET_CANDIDATE_DETAIL_BY_SEARCH + `?search=${search}`);
};
export const validateCandidateMobileNumberUniqueness = (formData: any) => {
  return httpPost(ROUTES.API.VALIDATE_MOBILE_UNIQUENESS, formData);
};
export const validateCandidateEmailUniqueness = (formData: any) => {
  return httpPost(ROUTES.API.VALIDATE_EMAIL_UNIQUENESS, formData);
};
export const getBranchCandidateDetailSearch = (search: string) => {
  return httpGet(ROUTES.API.GET_BRANCH_CANDIDATE_BY_SEARCH + `?search=${search}`);
};

// Branch Details
export const getBranchDetailById = (id: number) => {
  return httpGet(ROUTES.API.GET_BRANCH_DETAIL_BY_ID + `?id=${id}`);
};
export const getBranchGridList = (page: number = 1, size: number = 0) => {
  return httpGet(ROUTES.API.GET_BRANCH_GRID_LIST + `?page=${page}&size=${size ? size : ""}`);
};
export const insertUpdateBranchDetails = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_BRANCH_DETAILS, formData);
};
export const insertUpdateBranchAnyDetails = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_BRANCH_ANY_DETAILS, formData);
};
export const insertUpdateBranchPhotos = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_BRANCH_PHOTOS, formData);
};
export const getBranchPhotosList = (id: number) => {
  return httpGet(ROUTES.API.GET_BRANCH_PHOTOS + `?branchId=${id}`);
};
export const insertUpdateBranchRooms = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_BRANCH_ROOMS, formData);
};
export const getBranchRoomsList = (branchId: number | string, type = '') => {
  return httpGet(ROUTES.API.GET_BRANCH_ROOMS + `?branchId=${branchId}&type=${type}`);
};
export const insertUpdateBranchCots = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_BRANCH_COTS, formData);
};
export const getBranchCotsList = (id: number) => {
  return httpGet(ROUTES.API.GET_BRANCH_COTS + `?branchId=${id}`);
};
export const getCotsByCotId = (id: number) => {
  return httpGet(ROUTES.API.GET_COTS_BY_COT_ID + `?id=${id}`);
};
export const insertUpdateBranchAmenities = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_BRANCH_AMENITIES, formData);
};
export const getBranchAmenitiesList = (id: number) => {
  return httpGet(ROUTES.API.GET_BRANCH_AMENITIES + `?branchId=${id}`);
};

// User role access
export const insertUpdateUserRolePageAccess = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_ROLE_PAGE_ACCESS, formData);
};
export const getAdminUserList = (page: number = 1, size: number = 0) => {
  return httpGet(
    ROUTES.API.GET_USER_GRID_LIST + `?page=${page}&size=${size ? size : ""}`
  );
};
export const getRolePageAccess = () => {
  return httpGet(ROUTES.API.GET_ROLE_PAGE_ACCESS);
};
export const getRolePageAccessByRoleId = (roleId: number) => {
  return httpGet(
    ROUTES.API.GET_ROLE_PAGE_ACCESS_BY_ROLE_ID + `?roleId=${roleId}`
  );
};
export const insertUpdateUserRegister = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_USER_REGISTER, formData);
};

// BlackList
export const getBlacklistGridList = (page: number = 1, size: number = 0) => {
  return httpGet(ROUTES.API.GET_BLACKLIST_GRID_LIST + `?page=${page}&size=${size ? size : ""}`);
};
export const insertUpdateCandidateBlackList = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_BLACK_LIST, formData);
};

// FeedBack
export const insertUpdateCandidateFeedback = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_CANDIDATE_FEEDBACK, formData);
};
export const getCandidateFeedbackGridList = (
  page: number = 1,
  size: number = 0,
  branchId: string = "",
  fromDate: string = "",
  toDate: string = ""
) => {
  return httpGet(
    ROUTES.API.GET_CANDIDATE_FEEDBACKLIST +
    `?page=${page}&size=${size ? size : ""
    }&branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}`
  );
};
export const getCandidateFeedbackById = (formData: any) => {
  return httpGet(
    ROUTES.API.GET_CANDIDATE_FEEDBACK_BY_ID +
    `?candidateId=${formData?.candidateId || ""}&branchId=${formData?.branchId || ""
    }&admissionId=${formData?.admissionId || ""}&feedbackId=${formData?.feedbackId || ""
    }`
  );
};

// Attendance
export const getCandidateAttendanceGridList = (page: number = 1, size: number = 0) => {
  return httpGet(ROUTES.API.GET_ATTENDANCE_GRID_LIST + `?page=${page}&size=${size ? size : ""}`);
};

// Vacate
export const getVacateListGridList = (
  page: number = 1,
  size: number = 0,
  branchId: string = "",
  status: string = "",
  fromDate: string = "",
  toDate: string = ""
) => {
  return httpGet(
    ROUTES.API.GET_VACATE_GRID_LIST +
    `?page=${page}&size=${size ? size : ""
    }&branchId=${branchId}&status=${status}&fromDate=${fromDate}&toDate=${toDate}`
  );
};
export const insertUpdateVacateDetails = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_VACATE_DETAILS, formData);
};

export const deleteVacateDetails = (id: number) => {
  return httpDelete(ROUTES.API.DELETE_VACATE + `?id=${id}`);
};

export const getVacateByCandidateId = (candidateId: number) => {
  return httpGet(ROUTES.API.GET_VACATE_BY_CANDIDATE_ID + `?candidateId=${candidateId}`);
};

// Complaints
export const getComplaintsGridList = (
  page: number = 1,
  size: number = 0,
  branchId: string = "",
  status: string = "",
  fromDate: string = "",
  toDate: string = ""
) => {
  return httpGet(
    ROUTES.API.GET_COMPLAINTS_GRID_LIST +
    `?page=${page}&size=${size ? size : ""
    }&branchId=${branchId}&status=${status}&fromDate=${fromDate}&toDate=${toDate}`
  );
};
export const getComplaintsDetailsById = (branchId: string = "", complaintId: string = "") => {
  return httpGet(ROUTES.API.GET_COMPLAINTS_DETAILS_BY_ID + `?branchId=${branchId}&complaintId=${complaintId}`);
};
export const insertUpdateComplaints = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_COMPLAINTS, formData);
};
export const updateComplaintStatus = (formData: any) => {
  return httpPost(ROUTES.API.UPDATE_COMPLAINT_STATUS, formData);
};

// Dashboard's
export const getDashboardCots = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_COTS + queryStr);
};
export const getDashboardComplaints = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_COMPLAINTS + queryStr);
};
export const getDashboardPayments = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_PAYMENTS + queryStr);
};
export const getDashboardBookings = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_BOOKINGS + queryStr);
};
export const getDashboardPaymentsDetail = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_PAYMENTS_DETAIL + queryStr);
};
export const getDashboardBookingsDetail = (queryStr: string) => {
  return httpGet(ROUTES.API.GET_DASHBOARD_BOOKINGS_DETAIL + queryStr);
};
export const getDashboardCotsDetail = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_COTS_DETAIL + queryStr);
};
export const getDashboardComplaintsDetail = (queryStr: string = "") => {
  return httpGet(ROUTES.API.GET_DASHBOARD_COMPLAINTS_DETAIL + queryStr);
};

// Country-State-City
export const getAllCountry = () => {
  return httpGet(ROUTES.API.GET_MASTER_COUNTRY);
};
export const getAllStateByCountryCode = (id: number) => {
  return httpGet(ROUTES.API.GET_MASTER_STATE + `?countryId=${id}`);
};
export const getAllCityByStateCode = (id: number) => {
  return httpGet(ROUTES.API.GET_MASTER_CITY + `?stateId=${id}`);
};

// Upload Files
export const commonUploadFile = (formdata: any) => {
  return httpPost(ROUTES.API.UPLOAD_FILE, formdata);
};

// Payment Gateway
export const getRedirectToPayment = (formData: any) => {
  return httpPost(ROUTES.API.GET_PAYMENT_PAGE, formData);
};
export const updatePaymentStatus = (formData: any) => {
  return httpPost(ROUTES.API.UPDATE_PAYMENT_STATUS, formData);
};

// Payment Grid List
export const getPaymentGridList = (page: number = 1, size: number = 10, branchId: string = "", fromDate: string = "", toDate: string = "") => {
  return httpGet(
    ROUTES.API.GET_PAYMENT_GRID_LIST +
    `?page=${page}&size=${size ? size : ""}&branchId=${branchId}&fromDate=${fromDate}&toDate=${toDate}`
  );
};

// Payment Schedule Grid List
export const getPaymentScheduleGridList = (
  page: number = 1,
  size: number = 10,
  candidateId: string = "",
  fromDate: string = "",
  toDate: string = ""
) => {
  return httpGet(
    ROUTES.API.GET_PAYMENT_SCHEDULE_GRID_LIST +
    `?page=${page}&size=${size ? size : ""}&candidateId=${candidateId}&fromDate=${fromDate}&toDate=${toDate}`
  );
};

// Service Provider
export const getServiceProvider = (formData: any) => {
  const params = new URLSearchParams();
  if (formData?.search) params.append('search', formData.search);
  if (formData?.categoryId) params.append('categoryId', formData.categoryId);
  if (formData?.type) params.append('type', formData.type);
  const queryString = params.toString();
  return httpGet(ROUTES.API.GET_SERVICE_PROVIDER + (queryString ? `?${queryString}` : ''));
};
export const getServiceProviderCategory = () => {
  return httpGet(ROUTES.API.GET_SERVICE_PROVIDER_CATEGORY);
};
export const insertUpdateServiceProviderCategory = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_SERVICE_PROVIDER_CATEGORY, formData);
};
export const insertUpdateServiceProvider = (formData: any) => {
  return httpPost(ROUTES.API.INSERT_UPDATE_SERVICE_PROVIDER, formData);
};
export const generateInvoicePDF = (id: number) => {
  return httpGet(ROUTES.API.generateInvoicePDF + `?id=${id}`);
};
