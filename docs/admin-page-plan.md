# Admin Page - Full Implementation Plan

> This is the master reference document for building the Admin portal of the Hostel Management ERP.
> Strategy: **Port from inspiration codebase** with minimal changes. Rename branding, flatten folder structure, update configs.

---

## Source Paths (Inspiration)

```
BACKEND:  inspiration/shri-ladies-hostel-node-main/shri-ladies-hostel-node-main/
FRONTEND: inspiration/ladys-hostel-react-dev-main/ladys-hostel-react-dev-main/
```

Target structure:
```
hostelhost/
├── server/          ← backend (ported from shri-ladies-hostel-node-main)
├── client/          ← frontend (ported from ladys-hostel-react-dev-main)
├── docs/
└── inspiration/     ← reference only, not deployed
```

---

## Phase 0: Project Scaffolding & Config

### 0.1 Create folder structure
```
server/
├── app.js
├── app.config.js
├── .env
├── package.json
├── config/
│   └── config.js
├── models/
├── controllers/
├── routes/
├── helpers/
├── middleware/
├── crons/
├── paymentGateway/
├── uploads/
└── public/

client/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── configs/
    ├── routes/
    ├── providers/
    ├── services/
    ├── models/
    ├── components/
    ├── pages/
    └── assets/
```

### 0.2 Backend setup

| What | Source File | Action |
|------|-----------|--------|
| Entry point | `app.js` | Copy as-is. Change `SLH` references if any in DB config key |
| Config | `app.config.js` | Copy as-is. Uses dotenv — create `.env` with your DB creds |
| DB config | `config/config.js` | Copy as-is |
| `.env` | N/A | Create new with: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_DIALECT=mysql`, `DATABASE_SERVICE_API_DB`, `DATABASE_SERVICE_API_NAME`, `DATABASE_SERVICE_API_PASSWORD`, `PORT=14321`, `REACT_HOST`, `API_HOST`, `EMAIL_HOST/PORT/USER/PASS` |
| `package.json` | Copy | Rename `"name"` from `slh-users` → `hostelhost`. Copy all dependencies as-is |

**Key dependencies** (all already in inspiration package.json):
- express, sequelize, mysql2, cors, body-parser, cookie-parser, morgan
- multer (file uploads), bcrypt, uuid, crypto-js
- nodemailer, @sendgrid/mail (email)
- exceljs, xlsx (Excel)
- pdfkit-table, puppeteer (PDF/invoice)
- redis (caching — optional, currently commented out in auth middleware)
- moment, node-cron, winston

### 0.3 Frontend setup

| What | Source File | Action |
|------|-----------|--------|
| `package.json` | Copy | Rename `"name"` from `SLH` → `hostelhost` |
| `vite.config.ts` | Copy as-is |
| `tsconfig.json` | Copy as-is |
| `tsconfig.node.json` | Copy as-is |
| `index.html` | Copy, update `<title>` |
| `.eslintrc.cjs` | Copy as-is |
| `_redirects` | Copy as-is (Netlify redirects) |

**Key dependencies** (all in inspiration):
- react 18, react-dom, react-router-dom 6
- @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- axios, dayjs, moment, moment-timezone
- yup (validation), sweetalert2 (alerts)
- xlsx, file-saver (Excel export)
- react-otp-input (OTP login)
- styled-components, bootstrap, sass

### 0.4 Database setup ✅
- Create MySQL database — use `server/scripts/create-database.sql` or create manually; see `docs/database-setup.md`
- Run the backend once; `initializeDatabase()` in `app.js` calls `db.sequelize.sync()` and creates all tables from models
- Sequelize auto-creates all tables from models

**Done**: In `generateCandidateRegNo()` in `candidateDetails.controller.js`, the prefix is set to `Hh` (Hostel Host ERP).

---

## Phase 1: Core Infrastructure (Backend)

> Copy these files **verbatim** — they require zero or minimal changes.

### 1.1 Helpers
| File | Source | Changes |
|------|--------|---------|
| `helpers/utility.helper.js` | Copy | None — formatResponse.success/error used everywhere |
| `helpers/pagination.helper.js` | Copy | None — getPagination/getPagingData |
| `helpers/email.helper.js` | Copy | Update email templates/branding |
| `helpers/otp.helper.js` | Copy | None |
| `helpers/sms.helper.js` | Copy | Update SMS provider creds if needed |
| `helpers/upload.js` | Copy | None — multer config |
| `helpers/validate.body.js` | Copy | None |

### 1.2 Middleware
| File | Source | Changes |
|------|--------|---------|
| `middleware/verifyAuth.middle.js` | Copy | None — Bearer token auth via UserSessions table |
| `middleware/uploadFile.js` | Copy | None |
| `middleware/uploadFileMiddleware.js` | Copy | None |

### 1.3 Models — Copy ALL (zero changes needed)

Every model maps to a MySQL table. Copy all 35 model files:

| Model File | Table | Purpose |
|-----------|-------|---------|
| `masterCountry.model.js` | MASTER_COUNTRY | Country list |
| `masterState.model.js` | MASTER_STATE | State list |
| `masterCity.model.js` | MASTER_CITY | City list |
| `users.model.js` | Users | Admin/manager accounts |
| `userSession.model.js` | UserSessions | Auth sessions |
| `userOtp.model.js` | UserOtp | OTP records |
| `masterAmenitiesCategories.model.js` | MASTER_AMENITIES_CATEGORIES | Amenity groups |
| `masterAmenitiesSubCategories.model.js` | MASTER_AMENITIES_SUB_CATEGORIES | Amenity sub-groups |
| `masterAmenitiesFacilities.model.js` | MASTER_AMENITIES_FACILITIES | Individual amenities |
| `masterIssueCategories.model.js` | MASTER_ISSUE_CATEGORIES | Complaint categories |
| `masterIssueSubCategories.model.js` | MASTER_ISSUE_SUB_CATEGORIES | Complaint sub-categories |
| `masterBathroomType.model.js` | MASTER_BATHROOM_TYPE | Bathroom types |
| `masterRoomTypes.model.js` | MASTER_ROOM_TYPES | Room types (AC/Non-AC) |
| `masterSharingTypes.model.js` | MASTER_SHARING_TYPES | Sharing types (single/double) |
| `masterPageList.model.js` | MASTER_PAGE_LIST | Pages for RBAC |
| `masterUserRoles.model.js` | MASTER_USER_ROLES | Role definitions |
| `masterCotTypes.model.js` | MASTER_COT_TYPE | Cot/bed types |
| `rolePageAccess.model.js` | ROLE_PAGE_ACCESS | Role → Page access mapping |
| `rooms.model.js` | ROOMS | Rooms per branch |
| `cots.model.js` | COTS | Cots/beds per room |
| `feedback.model.js` | FEEDBACK | Candidate feedback |
| `vacate.model.js` | VACATE | Checkout records |
| `branchDetails.model.js` | BRANCH_DETAILS | Hostel branches |
| `branchPhotos.model.js` | BRANCH_PHOTOS | Branch gallery |
| `branchAmenitiesDetails.model.js` | BRANCH_AMENITIES_DETAILS | Branch amenities |
| `candidateDetails.model.js` | CANDIDATE_DETAILS | Student profiles |
| `candidateAdmission.model.js` | CANDIDATE_ADMISSION | Admission records |
| `candidateContactPersonDetails.model.js` | CANDIDATE_CONTACT_PERSON_DETAILS | Emergency contacts |
| `candidateDocumentDetails.model.js` | CANDIDATE_DOCUMENT_DETAILS | Uploaded docs |
| `candidateOtherDetails.model.js` | CANDIDATE_OTHER_DETAILS | Additional info |
| `candidatePurposeOfStay.model.js` | CANDIDATE_PURPOSE_OF_STAY | Reason for stay |
| `candidatePaymentDetails.model.js` | CANDIDATE_PAYMENT_DETAILS | Payment breakdown |
| `candidatePaymentSchedule.model.js` | CANDIDATE_PAYMENT_SCHEDULE | Scheduled payments |
| `complaints.model.js` | COMPLAINTS | Issues/complaints |
| `attendanceDetails.model.js` | ATTENDANCE_DETAILS | Attendance |
| `approvedNotification.model.js` | APPROVED_NOTIFICATION | Notifications |
| `serviceProviders.model.js` | SERVICE_PROVIDERS | Workers |
| `serviceProviderCategory.model.js` | SERVICE_PROVIDER_CATEGORY | Worker categories |
| `serviceProvidersOtp.model.js` | SERVICE_PROVIDERS_OTP | Worker OTP |

**`models/index.js`** — Copy as-is. This file:
- Creates Sequelize connection
- Imports all models
- Defines ALL foreign key relationships (50+ associations)

### 1.4 Route registration
| File | Source | Changes |
|------|--------|---------|
| `routes/index.js` | Copy | None — registers all route files |

### 1.5 Cron jobs
| File | Source | Changes |
|------|--------|---------|
| `crons/dailyJob.js` | Copy | Check what it does — likely payment overdue checks |

---

## Phase 2: Auth & User Management (Backend + Frontend)

### 2.1 Backend — Auth

| File | What it does | Changes |
|------|-------------|---------|
| `routes/users.route.js` | Admin login/register/user CRUD routes | None |
| `controllers/users.controller.js` (not listed but exists via routes) | OTP send, OTP verify, user register, user grid list | Change `SLH` branding in emails |
| `routes/candidateLoginSignup.route.js` | Student OTP login (for later phases) | None |
| `controllers/candidateLoginSignup.controller.js` | Student auth flows | None |

**Auth flow** (from verifyAuth.middle.js):
1. User sends OTP request → server generates OTP, sends via email/SMS
2. User verifies OTP → server creates `UserSessions` row with `accessToken`
3. All subsequent requests include `Authorization: Bearer <accessToken>`
4. Middleware validates token against `UserSessions` table

### 2.2 Frontend — Auth & Layout

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/main.tsx` | Copy | App entry, wraps in StateProvider + Router | None |
| `src/providers/StateProvider.tsx` | Copy | Context + useReducer global state | None |
| `src/providers/AxiosProvider.tsx` | Copy | Axios interceptors (401 → logout) | None |
| `src/providers/AppThemeProvider.tsx` | Copy | MUI theme config | Rebrand colors if desired |
| `src/providers/SkeletonProvider.tsx` | Copy | Loading skeleton wrapper | None |
| `src/services/HttpService.ts` | Copy | Axios wrapper (httpGet/httpPost/httpPut/httpDelete) with auto Bearer token | None |
| `src/services/AuthService.ts` | Copy | Login/logout, session storage helpers | None |
| `src/services/HelperService.ts` | Copy | userSession(), formatDate, etc. | None |
| `src/services/StateReducer.ts` | Copy | Reducer actions for global state | None |
| `src/services/ValidationService.ts` | Copy | Form validation helpers | None |
| `src/configs/constants.ts` | Copy | ALL route paths + API endpoint URLs | Change `baseApi` URL, rename branding |
| `src/routes/RouteApp.tsx` | Copy | All admin routes with lazy loading + page access check | None |
| `src/routes/RouteInit.tsx` | Copy | Init route (check session, redirect) | None |
| `src/components/layouts/authLayout.tsx` | Copy | Login page layout | Rebrand |
| `src/components/layouts/dashboardLayout.tsx` | Copy | Sidebar + header + content area | Rebrand sidebar labels/logo |
| `src/components/layouts/dashboardNewHeader.tsx` | Copy | Top header bar (user info, branch select, notifications) | Rebrand |
| `src/components/layouts/loadingPage.tsx` | Copy | Full-page loading spinner | None |
| `src/pages/auth/login.tsx` | Copy | OTP login form (mobile/email → OTP → verify) | Rebrand |

### 2.3 Frontend — Shared Components

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/components/helpers/CustomSearch.tsx` | Copy | Reusable search input | None |
| `src/components/helpers/CustomSelect.tsx` | Copy | Reusable dropdown select | None |
| `src/components/helpers/CustomDialogue.tsx` | Copy | Reusable MUI dialog | None |
| `src/components/helpers/CustomSwitch.tsx` | Copy | Toggle switch | None |
| `src/components/helpers/CustomAbsoluteBox.tsx` | Copy | Positioned container | None |
| `src/components/helpers/DateRangeSelector.tsx` | Copy | Date range picker | None |
| `src/components/helpers/DragDropUpload.tsx` | Copy | File upload component | None |
| `src/components/helpers/BulkUploadData.tsx` | Copy | Excel bulk upload component | None |
| `src/components/helpers/loader.tsx` | Copy | Spinner/loader | None |
| `src/components/helpers/PageLoading.tsx` | Copy | Page-level loading | None |
| `src/components/helpers/ScrollToTop.tsx` | Copy | Scroll to top on route change | None |
| `src/components/helpers/NoAccess.tsx` | Copy | "No access" message page | None |

### 2.4 Frontend — API Model Layer

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/models/index.ts` | Copy | ALL API call functions (100+ exports) | None — uses constants.ts for URLs |

This single file contains every API function:
- `getLoginOtp()`, `verifyLoginOtp()`
- All master CRUD functions
- All branch/room/cot functions
- All admission/candidate functions
- All complaint functions
- All dashboard functions
- All payment functions
- All vacate/feedback/blacklist functions
- All service provider functions
- `commonUploadFile()`, `generateInvoicePDF()`

### 2.5 Frontend — Assets

| Folder | Action |
|--------|--------|
| `src/assets/images/` | Copy all PNGs and SVGs |
| `src/assets/images/svgIcon/` | Copy all — sidebar icons, action icons |
| `src/assets/images/pngImage/` | Copy — default profile pics |
| `src/assets/images/exportImages.ts` | Copy — central image exports |

---

## Phase 3: Dashboard

### 3.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/dashboard.route.js` | Copy | Dashboard API routes | None |
| `controllers/dashboard.controller.js` | Copy | 8 endpoints with raw SQL aggregation queries | None |

**Endpoints:**
- `GET /api/get-dashboard-cots` — Total/occupied/vacant/booked cots summary
- `GET /api/get-dashboard-complaints` — Complaints grouped by status count
- `GET /api/get-dashboard-payments` — Total paid/pending/advance/refund summary
- `GET /api/get-dashboard-bookings` — Booking stats (total/confirmed/cancelled/pending)
- `GET /api/get-dashboard-cots-detail` — Detailed cot list with candidate assignment info
- `GET /api/get-dashboard-complaints-detail` — Complaints grouped by status with full detail
- `GET /api/get-dashboard-payments-detail` — Per-candidate payment breakdown
- `GET /api/get-dashboard-bookings-detail` — Per-candidate booking list

All support `?from=&to=&branchId=` filters.

### 3.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/home/index.tsx` | Copy | Dashboard main page — 4 summary cards (cots, complaints, payments, bookings), branch filter, date range filter | Rebrand |
| `src/pages/home/paymentStatus.tsx` | Copy | Payment gateway callback page | None |
| `src/pages/dashboardDetail/dashboard-cots-detail.tsx` | Copy | Drill-down: cot list with tabs (total/occupied/available/booked) | None |
| `src/pages/dashboardDetail/dashboard-complaints-detail.tsx` | Copy | Drill-down: complaints by status columns | None |
| `src/pages/dashboardDetail/dashboard-payments-detail.tsx` | Copy | Drill-down: payment list by candidate | None |
| `src/pages/dashboardDetail/dashboard-bookings-detail.tsx` | Copy | Drill-down: booking list with tabs | None |

---

## Phase 4: Branch, Room & Cot Management

### 4.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/branchDetails.route.js` | Copy | All branch/room/cot routes | None |
| `controllers/branchDetails.controller.js` | Copy | 20+ endpoints | None |

**Key endpoints:**
- `GET /api/get-branch-grid-list` — Paginated branch list
- `GET /api/get-branch-detail-by-id` — Single branch detail
- `POST /api/insert-update-branch-detail` — Create/update branch
- `POST /api/insert-update-branch-any-detail` — Partial update
- `POST /api/insert-update-branch-photo` — Upload branch photos
- `GET /api/get-branch-photo` — Get branch photos
- `POST /api/insert-update-room` — Create/update room
- `GET /api/get-rooms-by-branch-id` — Rooms list with cot status (Vacant/Occupied/Maintenance)
- `POST /api/insert-update-cot` — Create/update cots (bulk array)
- `GET /api/get-cots-by-room-id` — Cots by room
- `GET /api/get-cots-by-cot-id` — Single cot with room/branch details + fees
- `POST /api/insert-update-branch-amenities` — Manage branch amenities
- `GET /api/get-branch-amenities-details` — Get branch amenities
- `POST /api/bulk-upload-rooms` — Excel bulk import rooms
- `POST /api/bulk-upload-cots` — Excel bulk import cots

### 4.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/branch/index.tsx` | Copy | Branch list page — grid with create/edit, tab-based detail view | Rebrand |
| `src/pages/branch/components/branchDetails.tsx` | Copy | Branch create/edit form (name, address, contact, location) | None |
| `src/pages/branch/components/roomsAndCots.tsx` | Copy | Room list per branch, expand to see cots, create/edit rooms and cots | None |
| `src/pages/branch/components/branchPhotos.tsx` | Copy | Photo gallery upload for branch | None |
| `src/pages/branch/components/branchAmenities.tsx` | Copy | Amenities checklist per branch | None |

**Room creation flow:**
1. Select branch → see room list
2. Add room: room number, floor, room type (AC/Non-AC), sharing type, bathroom type, room size, number of cots
3. Set fees per room: admission fee, advance amount, late fee
4. Add cots under room: cot number, cot type, rent amount, advance, per-day rent

**Cot status tracking:**
- Branch stores `totalCots`, `cotVacant`, `cotOccupied`, `cotMaintenance` as comma-separated cot ID lists
- When admission is created → cot moves from vacant to occupied
- When admission is rejected/vacated → cot moves back to vacant
- Controller computes status dynamically in `getRoomByBranchId()`

---

## Phase 5: Master Data Management

### 5.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/master.route.js` | Copy | All master CRUD routes | None |
| `controllers/master.controller.js` | Copy | Generic CRUD for all master tables | None |

**Endpoints pattern** (repeated for each master):
- `GET /api/get-master-{type}` — List all
- `POST /api/insert-update-master-{type}` — Create/update
- `DELETE /api/delete-master-{type}?id=` — Soft/hard delete

**Master types:**
- Room types, Cot types, Sharing types, Bathroom types
- Issue categories, Issue sub-categories
- Amenities categories, sub-categories, facilities
- User roles, Page list
- Service provider categories

### 5.2 Frontend — Master Pages

Each master page follows the same pattern: MUI DataGrid + add/edit dialog.

| File | Source | What it does |
|------|--------|-------------|
| `src/pages/master/roomtype.tsx` | Copy | Room types CRUD (AC, Non-AC, etc.) |
| `src/pages/master/cotType.tsx` | Copy | Cot types CRUD (Single, Bunk, etc.) |
| `src/pages/master/SharingType.tsx` | Copy | Sharing types CRUD |
| `src/pages/master/bathroomType.tsx` | Copy | Bathroom types CRUD |
| `src/pages/master/IssueCategories.tsx` | Copy | Issue categories CRUD (Electrical, Plumbing, etc.) |
| `src/pages/master/IssuesSubCategories.tsx` | Copy | Issue sub-categories CRUD (linked to category) |
| `src/pages/master/amenitiesCategory.tsx` | Copy | Amenities category CRUD |
| `src/pages/master/amenitiesSubCategory.tsx` | Copy | Amenities sub-category CRUD |
| `src/pages/master/amenitiesFacilities.tsx` | Copy | Amenities facilities CRUD |
| `src/pages/master/MasterUserRole.tsx` | Copy | User roles CRUD |
| `src/pages/master/PageList.tsx` | Copy | Page list CRUD (for RBAC) |
| `src/pages/master/serviceProviderCategory.tsx` | Copy | Worker categories CRUD |
| `src/pages/master/bulkUpload.tsx` | Copy | Excel bulk upload page (candidates, rooms, cots, vacate, users) |

---

## Phase 6: Admission Management

### 6.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/candidateDetails.route.js` | Copy | All candidate/admission routes | None |
| `controllers/candidateDetails.controller.js` | Copy | 30+ endpoints — the largest controller (~2200 lines) | Change `SLH` prefix in `generateCandidateRegNo()` |

**Key endpoints:**
- `POST /api/insert-update-candidate-detail` — Create/update student profile
- `GET /api/get-candidate-detail` — Get student by ID
- `GET /api/get-candidate-details-by-search` — Search by name/mobile/email
- `POST /api/insert-update-candidate-document` — Upload documents
- `POST /api/insert-update-candidate-contact-person-detail` — Emergency contacts
- `POST /api/insert-update-candidate-purpose-of-stay` — Reason for stay
- `POST /api/insert-update-candidate-other-detail` — Additional info
- `POST /api/insert-update-candidate-admissions` — Create admission (assigns cot, validates availability)
- `POST /api/insert-update-candidate-admission-any-detail` — Update admission (handles approval/rejection, cot release, sends email on approval)
- `GET /api/get-admission-grid-list` — Paginated admission list
- `GET /api/get-approved-admission-grid-list` — Confirmed admissions only
- `GET /api/get-admission-booking-availability` — Check room/cot availability
- `GET /api/delete-candidate-admission` — Delete rejected admission (cascading)
- `POST /api/insert-update-candidate-payment-detail` — Payment details
- `POST /api/insert-update-candidate-payment-any-details` — Partial payment update
- `GET /api/get-eb-charges-grid-list` — EB charges by room type
- `POST /api/validate-mobile-uniqueness` — Check mobile number across tables
- `POST /api/validate-email-uniqueness` — Check email uniqueness
- `POST /api/bulk-upload-candidate-details` — Excel bulk import students
- `POST /api/insert-update-candidate-feedback` — Feedback CRUD
- `GET /api/get-candidate-feedback-grid-list` — Feedback list
- `GET /api/get-blacklist-grid-list` — Blacklisted candidates
- `POST /api/insert-update-candidate-black-list` — Blacklist a candidate
- `GET /api/get-attendance-grid-list` — Attendance list

### 6.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/admissions/index.tsx` | Copy | Admission list — tabs for pending/approved, grid with filters (branch, date), search | Rebrand |
| `src/pages/admissions/admissionConfirm.tsx` | Copy | Multi-step admission form (7 steps) | None |
| `src/pages/admissions/admissionTransfer.tsx` | Copy | Transfer candidate between rooms/branches | None |
| `src/pages/admissions/candidatePayments.tsx` | Copy | Payment details per candidate | None |
| `src/pages/admissions/candidatePaymentDetails.tsx` | Copy | Detailed payment breakdown view | None |
| `src/pages/admissions/ebCharges.tsx` | Copy | EB (electricity) charges management | None |

**Admission sub-components (multi-step form):**

| File | Source | Step | What it does |
|------|--------|------|-------------|
| `src/pages/admissions/components/candidateDetails.tsx` | Copy | Step 1 | Name, DOB, gender, mobile, email, address, photo upload |
| `src/pages/admissions/components/contactPerson.tsx` | Copy | Step 2 | Parent/guardian details, local guardian |
| `src/pages/admissions/components/documents.tsx` | Copy | Step 3 | Upload ID proofs, certificates |
| `src/pages/admissions/components/purposeOfStay.tsx` | Copy | Step 4 | Reason (study/work), organization details |
| `src/pages/admissions/components/roomAndFee.tsx` | Copy | Step 5 | Select branch → room → cot, auto-fill fees |
| `src/pages/admissions/components/payments.tsx` | Copy | Step 6 | Payment recording form |
| `src/pages/admissions/components/others.tsx` | Copy | Step 7 | Special care, how they heard about us |

**Admission status flow:**
```
New → Inprogress → Approved (email sent) → Active
                  → Rejected (cot released)
                  → Cancelled (cot released)
```

---

## Phase 7: Complaints / Issues System

### 7.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/complaints.route.js` | Copy | Complaint CRUD + status update routes | None |
| `controllers/complaints.controller.js` | Copy | 5 endpoints | None |

**Endpoints:**
- `GET /api/get-complaints-grid-list` — Paginated list with filters (branch, status, date, candidateId, serviceProviderId)
- `GET /api/get-complaints-details-by-id` — Full detail with joins (branch, room, cot, category, candidate, manager, service provider)
- `POST /api/insert-update-complaints` — Create/update complaint
- `POST /api/update-complaint-status` — Status transition with validation (only assigned provider can update, resolved photo required on close)
- `GET /api/get-complaints-by-status` — Grouped by status (for worker portal — but admin uses it too)

**Complaint status flow:**
```
Open → InProgress (worker picks up, assignedDateTime set)
     → Hold
     → Closed (requires resolvedPhotoUrl)
     → Reject
```

### 7.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/complaint/index.tsx` | Copy | Complaints grid with filters (branch, status, date range), detail dialog, create/edit form, assign to service provider | Rebrand |

**Admin complaint actions:**
- View all complaints across branches
- Create complaint (on behalf of student)
- Assign service provider + category to complaint
- Update status, add remarks
- View resolved photo

---

## Phase 8: Vacate (Checkout)

### 8.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/vacate.route.js` | Copy | Vacate CRUD routes | None |
| `controllers/vacate.controller.js` (via candidateDetails or dedicated) | Copy | Vacate endpoints | None |

**Endpoints:**
- `GET /api/get-vacate-grid-list` — Paginated list, filters (branch, status, date)
- `GET /api/get-vacate-by-candidate-id` — Vacate record for a candidate
- `POST /api/insert-update-vacate` — Create/update vacate record
- `DELETE /api/delete-vacate?id=` — Delete vacate

### 8.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/vacate/index.tsx` | Copy | Vacate list with grid, create vacate dialog, financial settlement form | Rebrand |

**Vacate form fields:**
- Select candidate (search)
- Vacate type, notice date, proposed date, actual date
- Financial settlement: advance paid, admission fee, monthly rent, penalty, pending dues, net payable
- Behavior feedback + damage remarks

---

## Phase 9: Payments & Invoicing

### 9.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/candidatePaymentSchedule.route.js` | Copy | Payment schedule routes | None |
| `controllers/candidatePaymentSchedule.controller.js` | Copy | Payment schedule CRUD | None |
| `routes/sendInvoice.route.js` | Copy | Invoice generation route | None |
| `paymentGateway/index.js` | Copy | Payment gateway route registration | None |
| `paymentGateway/payment.route.js` | Copy | Payment redirect + callback routes | None |
| `paymentGateway/payment.controller.js` | Copy | Payment gateway logic | Update gateway credentials |
| `paymentGateway/components/encryptEas.js` | Copy | Encrypt payment request | None |
| `paymentGateway/components/decryptEas.js` | Copy | Decrypt payment response | None |
| `paymentGateway/components/ReturnUrl.js` | Copy | Payment callback handler | None |

**Endpoints:**
- `GET /api/get-payment-grid-list` — All payments
- `GET /api/get-payment-schedule-grid-list` — Payment schedules per candidate
- `POST /api/get-payment-page` — Generate encrypted payment redirect URL
- `POST /api/update-payment-status` — Payment callback (success/failure)
- `GET /api/generate-invoice-pdf` — Generate PDF invoice for candidate

### 9.2 Frontend

Payment pages are embedded within the admissions flow:
- `src/pages/admissions/candidatePayments.tsx` — Payment grid
- `src/pages/admissions/candidatePaymentDetails.tsx` — Detailed payment view per candidate
- `src/pages/home/paymentStatus.tsx` — Payment gateway return page

---

## Phase 10: Workers / Service Providers

### 10.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/serviceProvider.route.js` | Copy | Service provider CRUD routes | None |
| `controllers/serviceProvider.controller.js` (referenced in routes) | Copy | Worker CRUD | None |

**Endpoints:**
- `GET /api/get-service-provider` — List with search/filter (name, category, type)
- `POST /api/insert-update-service-provider` — Create/update worker
- `GET /api/get-service-provider-category` — List categories
- `POST /api/insert-update-service-provider-category` — Create/update category

### 10.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/serviceProvider/index.tsx` | Copy | Worker list — search, filter by category/type, create/edit form | Rebrand |

**Worker fields:** Name, mobile, email, type (Internal/External), company name, GST, address, contact person, categories, rating

---

## Phase 11: User & Role Management

### 11.1 Backend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `routes/users.route.js` | Copy | User CRUD routes | None |
| `routes/rolePage.route.js` | Copy | Role-page access routes | None |

**Endpoints:**
- `GET /api/get-user-grid-list` — Admin user list (paginated)
- `POST /api/user-register` — Create/update admin user
- `GET /api/get-role-page-access` — All role-page mappings
- `GET /api/get-role-page-access-by-role-id` — Pages for a specific role
- `POST /api/insert-update-role-page-access` — Set page access per role

### 11.2 Frontend

| File | Source | What it does | Changes |
|------|--------|-------------|---------|
| `src/pages/userList/index.tsx` | Copy | User list — grid with create/edit dialog | Rebrand |
| `src/pages/userRolePageAccess/index.tsx` | Copy | Role → page access matrix (checkboxes for Full/ReadOnly/No per page) | None |
| `src/pages/master/userRolePageAccess/index.tsx` | Copy | Alternative role-page mapping page | None |

---

## Phase 12: Remaining Features

### 12.1 Feedback

| File | Source | Changes |
|------|--------|---------|
| `src/pages/feedBack/index.tsx` | Copy, rebrand |

Feedback grid with filters. Detail shows ratings (stay, food, cleanliness, security, staff), manager comments.

### 12.2 Blacklist

| File | Source | Changes |
|------|--------|---------|
| `src/pages/blackList/index.tsx` | Copy, rebrand |

Blacklisted candidates grid. Search candidate → blacklist with reason.

### 12.3 Attendance

| File | Source | Changes |
|------|--------|---------|
| `src/pages/attendance/index.tsx` | Copy, rebrand |

Attendance tracking grid.

### 12.4 Announcements

| File | Source | Changes |
|------|--------|---------|
| `src/pages/announcements/index.tsx` | Copy, rebrand |

Create/manage hostel announcements.

### 12.5 File Upload

| File | Source | Changes |
|------|--------|---------|
| `routes/upload.route.js` | Copy | None |
| `middleware/uploadFile.js` | Copy | None |

Handles `POST /api/upload-file` via multer → saves to `uploads/` folder.

### 12.6 Excel Export (Client-side)

Already built into frontend via `xlsx` + `file-saver` libraries. Each grid page has an export button that generates `.xlsx` from the displayed data. No backend changes needed.

### 12.7 Notifications

| File | Source | Changes |
|------|--------|---------|
| `routes/notification.route.js` | Copy | None |
| `controllers/notification.controller.js` | Copy | None |

### 12.8 Bulk Upload

| File | Source | Changes |
|------|--------|---------|
| `controllers/bulk-upload/bulkUpload.controller.js` | Copy | None |

---

## Phase 13: Rebranding & Cleanup

### 13.1 Naming changes

| What | From | To |
|------|------|-----|
| Candidate reg prefix | `SLH` | Your hostel prefix |
| App name in package.json | `slh-users` / `SLH` | `hostelhost-server` / `hostelhost-client` |
| Frontend title | "Shri Ladies Hostel" | Your hostel name |
| API base URL (prod) | `hostelhiveapi.sysmedac.com` | Your domain |
| Email templates | SLH branding | Your branding |

### 13.2 Gender-specific references
The inspiration is a **ladies' hostel** system. To make it generic:
- The `gender` field already exists on `CANDIDATE_DETAILS`
- No code-level gender restrictions exist — it's just branding
- Update any UI text that says "Ladies Hostel" to generic "Hostel"

### 13.3 Remove unused code
- The codebase has some commented-out code (Redis caching, older admission logic) — clean up if desired
- Some controller functions have duplicate implementations (old + new) — remove old versions

---

## Execution Order Summary

| Step | Phase | What | Effort |
|------|-------|------|--------|
| 1 | Phase 0 | Scaffold folders, copy configs, create .env, install deps | 30 min |
| 2 | Phase 1 | Copy ALL models, helpers, middleware | 15 min |
| 3 | Phase 2 | Auth + layout + shared components + API layer | 30 min |
| 4 | Phase 5 | Master data pages (simple CRUDs, gets the system bootstrapped) | 15 min |
| 5 | Phase 4 | Branch + Room + Cot management | 15 min |
| 6 | Phase 6 | Admissions (biggest feature) | 20 min |
| 7 | Phase 3 | Dashboard (needs data from admissions) | 10 min |
| 8 | Phase 7 | Complaints system | 10 min |
| 9 | Phase 10 | Workers/service providers | 10 min |
| 10 | Phase 8 | Vacate | 10 min |
| 11 | Phase 9 | Payments & invoicing | 15 min |
| 12 | Phase 11 | User & role management | 10 min |
| 13 | Phase 12 | Feedback, blacklist, attendance, announcements, bulk upload | 15 min |
| 14 | Phase 13 | Rebranding & cleanup | 20 min |
| | | **Total** | **~3.5 hours** |

> Timings assume copy-paste-rename approach. Actual coding from scratch would be 10-20x longer.

---

## File Count Summary

| Category | Files to Copy |
|----------|--------------|
| Backend models | 35 files |
| Backend controllers | ~12 files |
| Backend routes | 14 files |
| Backend helpers/middleware | 8 files |
| Backend config/crons/payment | 8 files |
| Frontend pages | ~30 files |
| Frontend components | ~15 files |
| Frontend services/providers/config | ~10 files |
| **Total** | **~132 files** |

---

## Testing Checklist (per phase)

After each phase is ported, verify:

- [ ] Backend starts without errors (`npm start`)
- [ ] Database tables are created via Sequelize sync
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Login flow works (OTP send → verify → session)
- [ ] Page access control works (role-based routing)
- [ ] Each CRUD operation works: create, read, update, delete
- [ ] Pagination works on all grid pages
- [ ] Filters work (branch, date range, status)
- [ ] File upload works (photos, documents)
- [ ] Excel export works on grid pages
- [ ] Search works on relevant pages
