const baseRoute = "/";

export let baseApi = "http://localhost:3000/api/";

export const ROUTES = {
  // HOME: baseRoute,
  LOGIN: baseRoute + "login",
  LOGOUT: baseRoute + "logout",
  PROFILE: baseRoute + "profile",
  AUTH: {
    HOME: baseRoute + "",
    LOGIN: baseRoute + "login",
  },
  HOME: {
    HOME: baseRoute + "",
    DASHBOARD: baseRoute + "dashboard",
    COMPLAINTS: baseRoute + "complaints",
    ADMISSION: {
      HOME: "admission",
      LIST: baseRoute + "admission/admission-list",
      CONFIRMATION: baseRoute + "admission/admission-confirmation",
      TRANSFER: baseRoute + "admission/admission-transfer",
      PAYMENTS: baseRoute + "admission/candidate-payments",
      EB_CHARGES: baseRoute + "admission/eb-charges",
    },
    ROOMS: baseRoute + "rooms",
    VACATE: baseRoute + "vacate",
    BRANCH: baseRoute + "branch",
    FEEDBACK: baseRoute + "feedback",
    ATTENDANCE: baseRoute + "attendance",
    MASTER: {
      HOME: "master",
      AMENITIES_CATEGORIES: baseRoute + "master/amenities-category",
      AMENITIES_SUB_CATEGORIES: baseRoute + "master/amenities-sub-category",
      AMENITIES_FACILITIES: baseRoute + "master/amenities-facilities",
      ROOM_TYPE: baseRoute + "master/room-type",
      COMPLAINTS: baseRoute + "master/complaints",
      BATHROOM_TYPE: baseRoute + "master/bathroom-type",
      COT_TYPE: baseRoute + "master/cot-type",
      ISSUE_CATEGORIES: baseRoute + "master/issue-category",
      ISSUE_SUB_CATEGORIES: baseRoute + "master/issue-sub-category",
      PAGE_LIST: baseRoute + "master/page-list",
      SHARING_TYPE: baseRoute + "master/sharing-type",
      MASTER_USER_ROLE: baseRoute + "master/user-role",
      SERVICE_PROVIDER_CATEGORY: baseRoute + "master/service-provider-category",
      BULK_UPLOAD: baseRoute + "master/bulk-upload",
    },
    BLACKLIST: baseRoute + "blacklist",
    USER: {
      HOME: "user",
      ROLE: baseRoute + "user/user-page-access",
      LIST: baseRoute + "user/user-list",
      SERVICE_PROVIDER: baseRoute + "user/service-provider",
    },
    ANNOUNCEMENTS: baseRoute + "announcements",
    PAYMENT_STATUS: baseRoute + "payment-status",
  },

  API: {
    UPLOAD_FILE: baseApi + "upload-file",
    DOWNLOAD_FILE: baseApi?.slice(0, -4),
    GET_LOGIN_OTP: baseApi + "user-send-otp",
    VERIFY_LOGIN_OTP: baseApi + "user-verify-otp",

    // Dashboard's
    GET_DASHBOARD_COTS: baseApi + "get-dashboard-cots",
    GET_DASHBOARD_COMPLAINTS: baseApi + "get-dashboard-complaints",
    GET_DASHBOARD_PAYMENTS: baseApi + "get-dashboard-payments",
    GET_DASHBOARD_PAYMENTS_DETAIL: baseApi + "get-dashboard-payments-detail",
    GET_DASHBOARD_BOOKINGS: baseApi + "get-dashboard-bookings",
    GET_DASHBOARD_BOOKINGS_DETAIL: baseApi + "get-dashboard-bookings-detail",
    GET_DASHBOARD_COTS_DETAIL: baseApi + "get-dashboard-cots-detail",
    GET_DASHBOARD_COMPLAINTS_DETAIL: baseApi + "get-dashboard-complaints-detail",

    // Master's
    GET_MASTER_AMENITIES_CATEGORY: baseApi + "get-master-amenities-category",
    GET_MASTER_AMENITIES_SUB_CATEGORY: baseApi + "get-master-amenities-sub-category",
    GET_MASTER_AMENITIES_SUB_FACILITIES: baseApi + "get-master-amenities-facilities",
    INSERT_UPDATE_MASTER_ROOM_TYPE: baseApi + "insert-update-master-room-type",
    GET_MASTER_ROOM_TYPE: baseApi + "get-master-room-type",
    GET_MASTER_COT_TYPE: baseApi + "get-master-cot-type",
    INSERT_UPDATE_MASTER_AMENITIES_CATEGORY: baseApi + "insert-update-master-amenities-category",
    INSERT_UPDATE_MASTER_AMENITIES_SUB_CATEGORY: baseApi + "insert-update-master-amenities-sub-category",
    INSERT_UPDATE_MASTER_AMENITIES_SUB_FACILITIES: baseApi + "insert-update-master-amenities-facilities",
    INSERT_UPDATE_MASTER_COT_TYPE: baseApi + "insert-update-master-cot-type",
    INSERT_UPDATE_MASTER_ISSUE_CATEGORY: baseApi + "insert-update-master-issue-category",
    GET_MASTER_ISSUE_CATEGORY: baseApi + "get-master-issue-category",
    INSERT_UPDATE_MASTER_BATHROOM_TYPE: baseApi + "insert-update-master-bathroom-type",
    GET_MASTER_BATHROOM_TYPE: baseApi + "get-master-bathroom-type",
    INSERT_UPDATE_MASTER_ISSUE_SUB_CATEGORY: baseApi + "insert-update-master-issue-sub-category",
    GET_MASTER_ISSUE_SUB_CATEGORY: baseApi + "get-master-issue-sub-category",
    INSERT_UPDATE_MASTER_PAGE_LIST: baseApi + "insert-update-master-page-list",
    GET_MASTER_PAGE_LIST: baseApi + "get-master-page-list",
    INSERT_UPDATE_SHARING_TYPE: baseApi + "insert-update-master-sharing-type",
    GET_MASTER_SHARING_TYPE: baseApi + "get-master-sharing-type",
    INSERT_UPDATE_MASTER_USER_ROLE: baseApi + "insert-update-master-user-role",
    GET_MASTER_USER_ROLE: baseApi + "get-master-user-role",

    DELETE_MASTER_AMENITIES_CATEGORY: baseApi + "delete-master-amenities-category",
    DELETE_MASTER_AMENITIES_SUBCATEGORY: baseApi + "delete-master-amenities-sub-category",
    DELETE_MASTER_AMENITIES_FACILITY: baseApi + "delete-master-amenities-facility",
    DELETE_MASTER_ROOM_TYPE: baseApi + "delete-master-room-type",
    DELETE_MASTER_BATHROOM_TYPE: baseApi + "delete-master-bathroom-type",
    DELETE_MASTER_COT_TYPE: baseApi + "delete-master-cot-type",
    DELETE_MASTER_SHARING_TYPE: baseApi + "delete-master-sharing-type",
    DELETE_MASTER_ISSUE_CATEGORY: baseApi + "delete-master-issue-category",
    DELETE_MASTER_ISSUE_SUB_CATEGORY: baseApi + "delete-master-issue-sub-category",
    DELETE_MASTER_PAGE_LIST: baseApi + "delete-master-page-list",
    DELETE_MASTER_USER_ROLE: baseApi + "delete-master-user-role",

    // Branch Details
    GET_BRANCH_CANDIDATE_BY_SEARCH: baseApi + "get-branch-candidate-by-search",
    GET_BRANCH_DETAIL_BY_ID: baseApi + "get-branch-detail-by-id",
    GET_BRANCH_GRID_LIST: baseApi + "get-branch-grid-list",
    INSERT_UPDATE_BRANCH_DETAILS: baseApi + "insert-update-branch-detail",
    INSERT_UPDATE_BRANCH_ANY_DETAILS: baseApi + "insert-update-branch-any-detail",
    INSERT_UPDATE_BRANCH_PHOTOS: baseApi + "insert-update-branch-photo",
    GET_BRANCH_PHOTOS: baseApi + "get-branch-photo",
    INSERT_UPDATE_BRANCH_ROOMS: baseApi + "insert-update-room",
    GET_BRANCH_ROOMS: baseApi + "get-rooms-by-branch-id",
    INSERT_UPDATE_BRANCH_COTS: baseApi + "insert-update-cot",
    GET_BRANCH_COTS: baseApi + "get-cots-by-room-id",
    GET_BRANCH_AMENITIES: baseApi + "get-branch-amenities-details",
    INSERT_BRANCH_AMENITIES: baseApi + "insert-update-branch-amenities",
    GET_COTS_BY_COT_ID: baseApi + "get-cots-by-cot-id",

    // User Page
    GET_USER_GRID_LIST: baseApi + "get-user-grid-list",
    GET_ROLE_PAGE_ACCESS: baseApi + "get-role-page-access",
    GET_ROLE_PAGE_ACCESS_BY_ROLE_ID: baseApi + "get-role-page-access-by-role-id",
    INSERT_UPDATE_ROLE_PAGE_ACCESS: baseApi + "insert-update-role-page-access",
    INSERT_UPDATE_USER_REGISTER: baseApi + "user-register",

    // Complaints
    GET_COMPLAINTS_GRID_LIST: baseApi + "get-complaints-grid-list",
    GET_COMPLAINTS_DETAILS_BY_ID: baseApi + "get-complaints-details-by-id",
    INSERT_UPDATE_COMPLAINTS: baseApi + "insert-update-complaints",
    UPDATE_COMPLAINT_STATUS: baseApi + "update-complaint-status",

    // Admission Grid List
    GET_APPROVED_ADMISSION_GRID_LIST: baseApi + "get-approved-admission-grid-list",
    GET_ADMISSION_GRID_LIST: baseApi + "get-admission-grid-list",
    GET_EB_CHARGES_GRID_LIST: baseApi + "get-eb-charges-grid-list",
    INSERT_UPDATE_CANDIDATE_DETAIL: baseApi + "insert-update-candidate-detail",
    GET_CANDIDATE_DETAIL: baseApi + "get-candidate-detail",
    INSERT_UPDATE_CANDIDATE_DOCUMENT: baseApi + "insert-update-candidate-document",
    GET_CANDIDATE_DOCUMENT: baseApi + "get-candidate-document",
    INSERT_UPDATE_CANDIDATE_CONTACT_PERSON_DETAIL: baseApi + "insert-update-candidate-contact-person-detail",
    GET_CANDIDATE_CONTACT_PERSON_DETAIL: baseApi + "get-candidate-contact-person-detail",
    INSERT_UPDATE_CANDIDATE_PURPOSE_OF_STAY: baseApi + "insert-update-candidate-purpose-of-stay",
    GET_CANDIDATE_PURPOSE_OF_STAY: baseApi + "get-candidate-purpose-of-stay",
    INSERT_UPDATE_CANDIDATE_OTHER_DETAIL: baseApi + "insert-update-candidate-other-detail",
    GET_CANDIDATE_OTHER_DETAIL: baseApi + "get-candidate-other-detail",
    INSERT_UPDATE_CANDIDATE_PAYMENT_DETAIL: baseApi + "insert-update-candidate-payment-detail",
    INSERT_UPDATE_CANDIDATE_PAYMENT_ANY_DETAILS: baseApi + "insert-update-candidate-payment-any-details",
    GET_CANDIDATE_PAYMENT_DETAIL: baseApi + "get-candidate-payment-detail",
    INSERT_UPDATE_CANDIDATE_ANY_DETAIL: baseApi + "insert-update-candidate-any-details",
    INSERT_UPDATE_CANDIDATE_ADMISSION_ANY_DETAIL: baseApi + "insert-update-candidate-admission-any-detail",
    INSERT_UPDATE_ADMISSION_CANDIDATE_ADMISSION: baseApi + "insert-update-candidate-admissions",
    GET_CANDIDATE_ADMISSION: baseApi + "get-candidate-admissions",
    GET_CANDIDATE_ADMISSION_BY_ID: baseApi + "get-candidate-admissions-by-id",
    GET_ADMISSION_BOOKING_AVAILABILITY: baseApi + "get-admission-booking-availability",
    DELETE_CANDIDATE_ADMISSION: baseApi + "delete-candidate-admission",

    // Candidate Feedback
    GET_CANDIDATE_DETAIL_BY_SEARCH: baseApi + "get-candidate-details-by-search",
    GET_BLACKLIST_GRID_LIST: baseApi + "get-blacklist-grid-list",
    INSERT_UPDATE_CANDIDATE_BLACK_LIST: baseApi + "insert-update-candidate-black-list",
    INSERT_UPDATE_CANDIDATE_FEEDBACK: baseApi + "insert-update-candidate-feedback",
    GET_CANDIDATE_FEEDBACKLIST: baseApi + "get-candidate-feedback-grid-list",
    GET_CANDIDATE_FEEDBACK_BY_ID: baseApi + "get-candidate-feedback-by-id",

    // Candidate Attendance
    GET_ATTENDANCE_GRID_LIST: baseApi + "get-attendance-grid-list",

    // Vacate
    GET_VACATE_GRID_LIST: baseApi + "get-vacate-grid-list",
    GET_VACATE_BY_CANDIDATE_ID: baseApi + "get-vacate-by-candidate-id",
    INSERT_UPDATE_VACATE_DETAILS: baseApi + "insert-update-vacate",
    DELETE_VACATE: baseApi + "delete-vacate",

    // Country-State-City
    GET_MASTER_COUNTRY: baseApi + "get-master-country",
    GET_MASTER_STATE: baseApi + "get-master-state",
    GET_MASTER_CITY: baseApi + "get-master-city",

    // Payment Gateway
    GET_PAYMENT_PAGE: baseApi + "get-payment-page",
    UPDATE_PAYMENT_STATUS: baseApi + "update-payment-status",

    // Payment Grid List
    GET_PAYMENT_GRID_LIST: baseApi + "get-payment-grid-list",

    // Payment Schedule Grid List
    GET_PAYMENT_SCHEDULE_GRID_LIST: baseApi + "get-payment-schedule-grid-list",

    // Mobile Number Validation
    VALIDATE_MOBILE_UNIQUENESS: baseApi + "validate-mobile-uniqueness",

    // Email Validation
    VALIDATE_EMAIL_UNIQUENESS: baseApi + "validate-email-uniqueness",

    // Bulk Upload
    BULK_UPLOAD_CANDIDATE_DETAILS: baseApi + "bulk-upload-candidate-details",
    BULK_UPLOAD_COTS: baseApi + "bulk-upload-cots",
    BULK_UPLOAD_ROOMS: baseApi + "bulk-upload-rooms",
    BULK_UPLOAD_VACATE: baseApi + "bulk-upload-vacate",
    BULK_UPLOAD_USERS: baseApi + "bulk-upload-users",

    // Service Provider
    GET_SERVICE_PROVIDER: baseApi + "get-service-provider",
    GET_SERVICE_PROVIDER_CATEGORY: baseApi + "get-service-provider-category",
    INSERT_UPDATE_SERVICE_PROVIDER_CATEGORY: baseApi + "insert-update-service-provider-category",
    INSERT_UPDATE_SERVICE_PROVIDER: baseApi + "insert-update-service-provider",

    // Generate Invoice
    generateInvoicePDF: baseApi + "generate-invoice-pdf",

  },
};
