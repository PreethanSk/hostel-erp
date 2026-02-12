# Hostel Management ERP - Product Requirements Document

## 1. Overview

A web-based ERP system for managing hostel operations end-to-end. Three user portals: **Admin**, **Student (Candidate)**, and **Worker (Service Provider)**. Built on top of a proven production codebase (inspiration folder).

---

## 2. Tech Stack (From Inspiration)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + MUI (Material UI) + SCSS |
| Routing | React Router v6 (lazy-loaded pages) |
| State | React Context + useReducer |
| Backend | Node.js + Express |
| ORM / DB | Sequelize + MySQL (mysql2) |
| Auth | OTP-based (mobile/email) via Nodemailer / SendGrid |
| File Upload | Multer |
| Caching | Redis |
| PDF / Invoice | pdfkit-table + Puppeteer |
| Excel Export/Import | xlsx + exceljs |
| Payment Gateway | Encrypted EAS (CCAvenue-style) |
| Validation | express-validator (backend), Yup (frontend) |

---

## 3. User Roles & Auth

### 3.1 Roles
| Role | Portal | Auth Method |
|------|--------|-------------|
| Admin / Manager | Admin Panel | OTP (mobile/email) |
| Student (Candidate) | Student Portal | OTP (mobile/email) |
| Worker (Service Provider) | Worker Portal | OTP (mobile) |

### 3.2 RBAC (Role-Based Access Control)
- **MasterUserRoles** - define roles (Super Admin, Branch Manager, etc.)
- **MasterPageList** - define all pages/routes in the system
- **RolePageAccess** - map each role to pages with access level (Full / ReadOnly / No)
- Frontend checks `pageAccess` array before rendering each route

---

## 4. Database Schema

### 4.1 Core Entities

#### Branches
```
BRANCH_DETAILS
├── id, branchName, branchCode, contactPerson
├── branchAddress, city, state, country, pincode
├── mobileNumber, notes
├── numberOfRooms, numberOfCots
├── totalCots, cotVacant, cotOccupied, cotMaintenance
└── isActive, createdAt, updatedAt
```

#### Rooms
```
ROOMS
├── id, branchId (FK → BRANCH_DETAILS)
├── roomTypeId (FK → MASTER_ROOM_TYPES)
├── sharingTypeId (FK → MASTER_SHARING_TYPES)
├── bathroomTypeId (FK → MASTER_BATHROOM_TYPE)
├── roomNumber, floorNumber, roomSize
├── numberOfCots, oneDayStay
├── admissionFee, advanceAmount, lateFeeAmount
└── isActive, notes, createdAt, updatedAt
```

#### Cots (Beds)
```
COTS
├── id, roomId (FK → ROOMS)
├── cotTypeId (FK → MASTER_COT_TYPES)
├── cotNumber, rentAmount, advanceAmount, perDayRent
├── cotPhotos
└── isActive, createdAt, updatedAt
```

#### Candidates (Students)
```
CANDIDATE_DETAILS
├── id, candidateId (display ID)
├── name, dob, gender
├── mobileNumber, mobileCountryCode, email
├── address, place, city, pincode, state, country
├── profilePicture
├── blackListed, blackListedDate, blackListedReason, blackListedBy
├── informToParents, informToLocalGuardian
├── emailVerifiedAt, mobileVerifiedAt
└── isActive, createdAt, updatedAt
```

#### Admissions
```
CANDIDATE_ADMISSION
├── id, candidateRefId (FK), branchRefId (FK), roomRefId (FK), cotRefId (FK)
├── dateOfAdmission, dateOfNotice
├── admissionFee, advancePaid, monthlyRent, lateFeeAmount
├── tokenAmount, ebCharges, miscellaneousCharges
├── noDayStayType, noDayStay, dues
├── admissionStatus, admissionStatusReason
├── admissionType, admittedBy
├── paymentStatus, discountOffer
├── cancellationFee, refundAmount, cancelReason
├── vacate (boolean)
└── isActive, createdAt, updatedAt
```

#### Payment Details
```
CANDIDATE_PAYMENT_DETAILS
├── id, admissionRefId (FK), candidateRefId (FK)
├── paymentOption, paidAmount, dueToPaid, dueDate
├── admissionFeePaid/Pending, advancePaid/Pending
├── monthlyRentPaid/Pending, lateFeePaid/Pending
├── tokenAmountPaid/Pending, refundPaid/Pending
├── cancellationFeePaid/Pending
├── ebChargePaid/Pending, miscellaneousPaid/Pending
├── totalPaidAmount, totalPendingAmount
└── isActive, createdAt, updatedAt
```

#### Payment Schedule
```
CANDIDATE_PAYMENT_SCHEDULE
├── id, admissionRefId (FK), candidateRefId (FK)
├── scheduledDate, amountDue, amountPaid
├── status (pending | paid | partial | overdue)
├── paymentDate
└── isActive, createdAt, updatedAt
```

#### Complaints / Issues
```
COMPLAINTS
├── id, branchRefId (FK), roomRefId (FK), cotRefId (FK)
├── issueTypeRefId (FK → MASTER_ISSUE_CATEGORIES)
├── issueSubCategoryRefId (FK → MASTER_ISSUE_SUB_CATEGORIES)
├── complaintDescription, photosUrl, resolvedPhotoUrl
├── createdBy, reportedBy
├── raisedByCandidateId (FK), raisedByManagerId (FK)
├── raisedDateTime, closedDateTime, holdDateTime, resolvedDateTime
├── lastUpdatedDateTime, lastUpdatedBy
├── assignedToUserId (FK → Users), assignedName, assignedBy, assignedDateTime
├── serviceProviderId (FK → SERVICE_PROVIDERS)
├── serviceCategoryId (FK → SERVICE_PROVIDER_CATEGORY)
├── escortedBy, remarks
├── complaintStatus (Open | InProgress | Hold | Closed | Reject)
└── isActive, createdAt, updatedAt
```

#### Vacate (Checkout)
```
VACATE
├── id, candidateRefId (FK), branchRefId (FK), admissionRefId (FK)
├── vacateType, vacateStatus
├── feedbackBehavior, feedbackBrief, damageRemarks
├── payableAdvancePaid, payableAdmissionFee
├── payableMonthlyRent, payablePenalty, payableDuePending
├── netAmountPayable
├── dateOfNoticeGiven, proposedVacatingDate, actualVacatingDate
└── isActive, createdAt, updatedAt
```

#### Service Providers (Workers)
```
SERVICE_PROVIDERS
├── id, name, mobile, email
├── type (Internal | External)
├── categories, companyName, address
├── gstNumber, contactPerson, rating
└── isActive, createdAt, updatedAt
```

#### Feedback
```
FEEDBACK
├── id, candidateRefId (FK), branchRefId (FK), admissionRefId (FK)
├── rateStay, rateFoodService, rateCleanliness
├── rateSecuritySafety, rateSupportStaff
├── managerCandidateBehavior, managerComments
├── candidateRemarks
└── isActive, createdAt, updatedAt
```

### 4.2 Master / Lookup Tables
| Table | Purpose |
|-------|---------|
| MASTER_ROOM_TYPES | AC, Non-AC, etc. |
| MASTER_COT_TYPES | Single, Bunk, etc. |
| MASTER_SHARING_TYPES | Single, Double, Triple, etc. |
| MASTER_BATHROOM_TYPE | Attached, Common, etc. |
| MASTER_ISSUE_CATEGORIES | Electrical, Plumbing, Housekeeping, etc. |
| MASTER_ISSUE_SUB_CATEGORIES | Fan issue, Tap leak, etc. (FK → category) |
| MASTER_AMENITIES_CATEGORIES | Facility groups |
| MASTER_AMENITIES_SUB_CATEGORIES | Facility sub-groups |
| MASTER_AMENITIES_FACILITIES | Individual amenities |
| MASTER_USER_ROLES | Admin, Manager, etc. |
| MASTER_PAGE_LIST | All pages in the system |
| SERVICE_PROVIDER_CATEGORY | Electrician, Plumber, etc. |
| MasterCountry / MasterState / MasterCity | Location data |

### 4.3 Auth Tables
| Table | Purpose |
|-------|---------|
| Users | Admin/manager accounts (firstName, lastName, email, mobile, userRoleId, branchId) |
| UserSessions | Active sessions per user |
| UserOtp | OTP records for admin login |
| ServiceProviderOtp | OTP records for worker login |

### 4.4 Supporting Tables
| Table | Purpose |
|-------|---------|
| CANDIDATE_CONTACT_PERSON_DETAILS | Emergency contacts per candidate |
| CANDIDATE_DOCUMENT_DETAILS | Uploaded documents (ID proof, etc.) |
| CANDIDATE_OTHER_DETAILS | Additional candidate info |
| CANDIDATE_PURPOSE_OF_STAY | Reason for hostel stay |
| BRANCH_PHOTOS | Branch gallery images |
| BRANCH_AMENITIES_DETAILS | Amenities available at a branch |
| ATTENDANCE_DETAILS | Candidate attendance tracking |
| ROLE_PAGE_ACCESS | Maps role → page → access level |
| APPROVED_NOTIFICATION | Notification records |

---

## 5. Feature Breakdown by Portal

### 5.1 Admin Portal

#### 5.1.1 Dashboard
- Summary cards: total cots, occupied, vacant, maintenance
- Complaints overview by status (open, in-progress, closed)
- Payment collection summary (paid, pending, overdue)
- Booking/admission stats
- Drill-down detail pages for each card
- Filter by branch and date range

#### 5.1.2 Branch Management
- **List branches** with grid view (paginated)
- **Create/edit branch** - name, code, address, contact person, mobile, location
- **Branch photos** - upload/manage gallery
- **Branch amenities** - map amenities from master list
- **Rooms & Cots tab** - view all rooms and cots under the branch

#### 5.1.3 Room Management
- **Create rooms** under a branch
- Fields: room number, floor, room type, sharing type, bathroom type, room size, number of cots
- **Fee config per room**: admission fee, advance amount, late fee
- One-day stay toggle

#### 5.1.4 Cot Management
- **Create cots** under a room
- Fields: cot number, cot type, rent amount, advance amount, per-day rent
- Cot photos upload

#### 5.1.5 Admission Management
- **Admission list** - paginated grid, filterable by branch, date range
- **New admission** - multi-step form:
  1. **Candidate Details** - name, DOB, gender, mobile, email, address, photo
  2. **Contact Person** - emergency/guardian details
  3. **Documents** - upload ID proofs, certificates
  4. **Purpose of Stay** - reason for hostel stay
  5. **Room & Fee** - select branch → room → cot, auto-fill fees, set dates
  6. **Payment** - admission fee, advance, monthly rent, late fee config
  7. **Other Details** - any additional info
- **Admission confirmation** - approve/reject pending admissions
- **Admission transfer** - move candidate to a different room/cot/branch
- **Booking availability check** - verify room/cot is free for a given date

#### 5.1.6 Fee & Payment Management
- **Candidate payment details** - view full payment breakdown per admission
- **Payment schedule** - auto-generated monthly schedule (pending, paid, partial, overdue)
- **EB (electricity) charges** - manage utility charges per room type
- **Payment grid** - all payments filterable by branch, date
- **Payment gateway integration** - encrypted redirect for online payments
- **Invoice generation** - PDF invoice per candidate (via Puppeteer/pdfkit)

#### 5.1.7 Complaints / Issues
- **Complaints grid** - filterable by branch, status, date range
- **Complaint detail view** - full info with issue category/subcategory, room, candidate, photos
- **Create complaint** (admin can raise on behalf of a student)
- **Assign to worker (service provider)** - select internal/external worker, set category
- **Status flow**: Open → InProgress → Hold → Closed / Reject
- Resolved photo required on closure
- Timestamps tracked: raised, assigned, hold, resolved, closed

#### 5.1.8 Vacate (Checkout)
- **Vacate grid** - filterable by branch, status, date range
- **Create vacate** - select candidate + admission
- Fields: vacate type, notice date, proposed date, actual date
- **Financial settlement**: advance paid, admission fee, monthly rent, penalty, dues, net payable
- Feedback on candidate behavior
- Damage remarks

#### 5.1.9 Worker / Service Provider Management
- **Service provider list** - search by name, filter by category and type (Internal/External)
- **Create/edit worker** - name, mobile, email, company, GST, address, contact person, categories, rating
- **Service provider categories** - master list (Electrician, Plumber, etc.)

#### 5.1.10 User & Role Management
- **User list** - all admin/manager users (paginated)
- **Create/edit user** - first name, last name, email, mobile, role, branch assignment
- **User roles** - create roles (Super Admin, Branch Manager, etc.)
- **Page access control** - per role, set access level (Full / ReadOnly / No) for each page

#### 5.1.11 Blacklist
- **Blacklisted candidates grid** (paginated)
- **Blacklist a candidate** - set reason, date, inform parents/guardian flags

#### 5.1.12 Feedback
- **Feedback grid** - filterable by branch, date range
- **View feedback detail** - ratings (stay, food, cleanliness, security, staff), comments
- Manager can add behavior rating and comments

#### 5.1.13 Attendance
- **Attendance grid** - track candidate presence

#### 5.1.14 Announcements
- Create and manage hostel-wide announcements

#### 5.1.15 Bulk Upload
- Excel-based import for: candidates, rooms, cots, vacate records, users

#### 5.1.16 Excel Export
- Export any grid/list data to Excel (xlsx)

#### 5.1.17 Master Data Management
- CRUD for all lookup tables:
  - Room types, Cot types, Sharing types, Bathroom types
  - Issue categories & subcategories
  - Amenities categories, subcategories, facilities
  - User roles, Page list
  - Service provider categories

---

### 5.2 Student Portal

#### 5.2.1 Login
- OTP-based login via mobile number or email

#### 5.2.2 My Room & Cot
- View assigned branch, room number, cot number
- Admission details (date of admission, fees)

#### 5.2.3 Raise Issue / Complaint
- Select issue category → subcategory
- Add description and upload photo
- Submit complaint (auto-linked to their branch/room/cot)

#### 5.2.4 My Complaints
- View list of raised complaints with status
- Track status changes (Open → InProgress → Closed)

#### 5.2.5 Dues & Payments
- View payment schedule (upcoming, overdue, paid)
- See breakdown: admission fee, advance, monthly rent, late fee, EB charges, miscellaneous
- **Pay online** via payment gateway
- Payment status page (success/failure callback)

#### 5.2.6 Feedback
- Submit feedback ratings (stay, food, cleanliness, security, staff)
- Add remarks

---

### 5.3 Worker (Service Provider) Portal

#### 5.3.1 Login
- OTP-based login via mobile number

#### 5.3.2 My Assigned Issues
- View complaints grouped by status: Open, InProgress, Hold, Closed, Reject
- See complaint details: branch, room, cot, category, description, photos

#### 5.3.3 Update Issue Status
- **Pick task**: Open → InProgress (auto-sets assignedDateTime)
- **Put on hold**: InProgress → Hold
- **Close task**: InProgress → Closed (must upload resolved photo + comment)
- **Reject task**: with reason
- Only assigned worker can update (enforced server-side)

---

## 6. Key Relationships

```
Branch
 └── Rooms (1:N)
      └── Cots (1:N)
           └── Admissions (1:N - via candidateAdmission)
                ├── Candidate (N:1)
                ├── Payment Details (1:N)
                ├── Payment Schedule (1:N)
                ├── Vacate (1:N)
                └── Feedback (1:N)

Complaint
 ├── Branch, Room, Cot (where)
 ├── Issue Category → Sub Category (what)
 ├── Candidate OR Manager (who raised)
 ├── Service Provider (who's assigned)
 └── Status lifecycle with timestamps

User (Admin/Manager)
 ├── Role → Page Access (RBAC)
 └── Branch assignment
```

---

## 7. API Structure

All APIs follow the pattern: `POST /api/{action}` for mutations, `GET /api/{action}` for queries.

### Route Groups
| Route File | Covers |
|-----------|--------|
| users.route | Admin login, user CRUD, OTP send/verify |
| candidateLoginSignup.route | Student auth |
| branchDetails.route | Branch CRUD, rooms, cots, amenities, photos |
| candidateDetails.route | Candidate CRUD, admission, payments, documents |
| candidatePaymentSchedule.route | Payment schedule CRUD |
| complaints.route | Complaint CRUD, status updates |
| vacate.route | Vacate CRUD |
| dashboard.route | Dashboard aggregations |
| master.route | All master table CRUD |
| rolePage.route | Role-page access management |
| serviceProvider.route | Worker CRUD, categories |
| sendInvoice.route | Invoice PDF generation |
| upload.route | File uploads (multer) |
| notification.route | Notifications |
| bulkUpload.controller | Excel bulk import |
| payment.route | Payment gateway redirect & callback |

---

## 8. Implementation Strategy

Since the inspiration codebase is production-grade, the approach is **port & adapt**:

1. **Backend**: Copy the Node.js codebase, update config (DB credentials, API keys), rename tables/branding as needed
2. **Frontend**: Copy the React codebase, update API base URL, rebrand UI
3. **Database**: Run Sequelize sync or create migrations from the existing models
4. **Customize**: Add/remove features based on specific hostel requirements (e.g., the inspiration system is for a ladies' hostel - generalize as needed)

### Priority Order
| Phase | Features | Effort |
|-------|----------|--------|
| P0 - Core | Auth, Branch, Room, Cot, Admission, Basic Payments | Port from inspiration |
| P1 - Operations | Complaints, Worker assignment, Vacate | Port from inspiration |
| P2 - Finance | Payment gateway, Invoice PDF, EB charges, Excel export | Port from inspiration |
| P3 - Extras | Dashboard, Feedback, Attendance, Announcements, Blacklist, Bulk upload | Port from inspiration |
| P4 - Polish | Student portal, Worker portal (may need new UI if inspiration only has admin) | Build / adapt |

---

## 9. Non-Functional Requirements

- **Auth Security**: OTP-based, session tokens, Redis for session caching
- **File Storage**: Multer for local uploads (can swap to S3/Cloudinary)
- **Pagination**: All grids paginated server-side
- **Excel Export**: Client-side via xlsx library
- **PDF Generation**: Server-side via Puppeteer + pdfkit
- **Validation**: Yup (frontend) + express-validator (backend)
- **Error Handling**: Centralized formatResponse helper for consistent API responses
