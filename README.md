# Hostel Host

A full-stack web-based ERP system for managing hostel operations end-to-end. The platform serves three distinct user portals — **Admin**, **Student**, and **Service Worker** — covering everything from admissions and payments to complaint resolution and facility management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Material UI (MUI), SCSS |
| Routing | React Router v6 (lazy-loaded pages) |
| State | React Context + useReducer |
| Charts | Recharts |
| Backend | Node.js, Express |
| ORM / DB | Sequelize + MySQL |
| Auth | OTP-based (mobile/email) via SendGrid |
| File Upload | Multer |
| Caching | Redis |
| PDF / Invoice | pdfkit-table, Puppeteer |
| Excel Export/Import | xlsx, exceljs |
| Payment Gateway | Encrypted redirect (CCAvenue-style) |
| Validation | express-validator (backend), Yup (frontend) |
| Containerization | Docker Compose |

## Project Structure

```
hostel-erp/
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Node.js + Express backend
│   ├── controllers/ # Business logic
│   ├── models/      # Sequelize models
│   ├── routes/      # API route definitions
│   ├── middleware/   # Auth & validation middleware
│   ├── migrations/  # Database migrations
│   ├── helpers/     # Utility functions
│   ├── validations/ # Request validation schemas
│   ├── crons/       # Scheduled tasks
│   └── uploads/     # File upload storage
├── docs/            # Documentation
└── docker-compose.yml
```

## Features

### Admin Portal

#### Dashboard
- Summary cards for total cots, occupied, vacant, and under maintenance
- Complaints overview grouped by status (open, in-progress, closed)
- Payment collection summary (paid, pending, overdue)
- Booking and admission statistics
- Drill-down detail pages for each metric
- Filters by branch and date range

#### Branch Management
- Create, edit, and list branches with paginated grid view
- Upload and manage branch photo galleries
- Map amenities to branches from a master amenities list
- View all rooms and cots under each branch

#### Room Management
- Create and configure rooms under a branch
- Set room number, floor, room type (AC/Non-AC), sharing type (single/double/triple), bathroom type (attached/common), and room size
- Configure fees per room: admission fee, advance amount, late fee
- Toggle one-day stay availability

#### Cot (Bed) Management
- Create and manage cots within rooms
- Set cot number, cot type (single/bunk), rent amount, advance amount, per-day rent
- Upload cot photos

#### Admission Management
- Paginated admission list, filterable by branch and date range
- Multi-step admission form:
  1. **Candidate Details** — name, DOB, gender, mobile, email, address, photo
  2. **Contact Person** — emergency/guardian information
  3. **Documents** — upload ID proofs and certificates
  4. **Purpose of Stay** — reason for hostel stay
  5. **Room & Fee** — select branch, room, and cot with auto-filled fees
  6. **Payment** — admission fee, advance, monthly rent, late fee configuration
  7. **Other Details** — any additional info
- Approve or reject pending admissions
- Transfer candidates between rooms, cots, or branches
- Booking availability check for rooms and cots

#### Fee & Payment Management
- Full payment breakdown per admission (admission fee, advance, monthly rent, late fee, EB charges, miscellaneous)
- Auto-generated monthly payment schedules with statuses: pending, paid, partial, overdue
- Electricity (EB) charge management per room type
- Payment grid filterable by branch and date
- Online payment gateway integration with encrypted redirect and callback handling
- PDF invoice generation per candidate (Puppeteer / pdfkit)

#### Complaints / Issues
- Complaints grid filterable by branch, status, and date range
- Detailed complaint view with issue category/subcategory, room info, candidate info, and photos
- Admins can raise complaints on behalf of students
- Assign complaints to internal or external service providers
- Status lifecycle: **Open → In Progress → Hold → Closed / Rejected**
- Resolved photo required on closure
- Full timestamp tracking: raised, assigned, hold, resolved, closed

#### Vacate (Checkout)
- Vacate grid filterable by branch, status, and date range
- Create vacate requests for candidates with notice date, proposed date, and actual vacating date
- Financial settlement: advance paid, admission fee, monthly rent, penalty, pending dues, net payable amount
- Candidate behavior feedback and damage remarks

#### Worker / Service Provider Management
- List service providers with search by name and filter by category and type (internal/external)
- Create and edit worker profiles: name, mobile, email, company, GST number, address, categories, rating
- Manage service provider categories (electrician, plumber, etc.)

#### User & Role Management (RBAC)
- Create and manage admin/manager user accounts
- Define roles (Super Admin, Branch Manager, etc.)
- Page-level access control per role: Full, Read-Only, or No Access
- Frontend route protection based on role-page access mapping

#### Additional Admin Features
- **Blacklist Management** — blacklist candidates with reason, date, and parent/guardian notification flags
- **Feedback Management** — view candidate feedback with ratings for stay, food, cleanliness, security, and staff
- **Attendance Tracking** — track candidate presence
- **Announcements** — create and manage hostel-wide announcements
- **Bulk Upload** — Excel-based import for candidates, rooms, cots, vacate records, and users
- **Excel Export** — export any grid or list data to `.xlsx`
- **Master Data Management** — CRUD for all lookup tables: room types, cot types, sharing types, bathroom types, issue categories/subcategories, amenities, user roles, page list, service provider categories, and location data (country/state/city)

---

### Student Portal

| Feature | Description |
|---|---|
| **OTP Login** | Login via mobile number or email with OTP verification |
| **My Room & Cot** | View assigned branch, room number, cot number, and admission details |
| **Raise Complaint** | Select issue category and subcategory, add description, upload photo — auto-linked to the student's branch/room/cot |
| **My Complaints** | Track all raised complaints with real-time status updates |
| **Dues & Payments** | View payment schedule (upcoming, overdue, paid), see full fee breakdown, and pay online via payment gateway |
| **Feedback** | Submit ratings for stay, food, cleanliness, security, and support staff with remarks |

---

### Service Worker Portal

| Feature | Description |
|---|---|
| **OTP Login** | Login via mobile number with OTP verification |
| **Assigned Issues** | View complaints grouped by status: Open, In Progress, Hold, Closed, Rejected |
| **Issue Details** | See branch, room, cot, category, description, and attached photos for each complaint |
| **Update Status** | Pick task (Open → In Progress), put on hold, close (with resolved photo + comment), or reject with reason |
| **Access Control** | Only the assigned worker can update a complaint (enforced server-side) |

---

## Database Schema

### Core Entities
- **Branch Details** — hostel branches with address, contact info, room/cot capacity
- **Rooms** — rooms within branches with type, sharing, bathroom config, and fee setup
- **Cots** — individual beds within rooms with rent and type info
- **Candidate Details** — student profiles with contact, address, and verification status
- **Candidate Admission** — links a candidate to a branch/room/cot with fees, dates, and admission status
- **Payment Details** — detailed payment breakdown per admission
- **Payment Schedule** — monthly payment schedule with status tracking
- **Complaints** — issue tracking with full lifecycle, assignment, and resolution
- **Vacate** — checkout records with financial settlement
- **Service Providers** — internal and external workers with categories and ratings
- **Feedback** — candidate ratings and manager comments

### Master / Lookup Tables
Room types, cot types, sharing types, bathroom types, issue categories, issue subcategories, amenities (categories, subcategories, facilities), user roles, page list, service provider categories, and location data (country, state, city).

### Auth Tables
Users, user sessions, user OTP, and service provider OTP.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hostel-erp.git
   cd hostel-erp
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   # Configure your .env file with DB credentials, Redis config, and SendGrid API key
   npm start
   ```

3. **Set up the frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Using Docker** (alternative)
   ```bash
   docker-compose up
   ```

### Environment Variables

The server requires the following environment variables (create a `.env` file in `server/`):

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `REDIS_URL` | Redis connection URL |
| `SENDGRID_API_KEY` | SendGrid API key for OTP emails |
| `PORT` | Server port (default: 3000) |

## API Structure

All APIs follow RESTful conventions: `POST` for mutations, `GET` for queries.

| Route Group | Covers |
|---|---|
| `/api/users` | Admin login, user CRUD, OTP send/verify |
| `/api/candidates` | Student auth, candidate CRUD, admission, payments, documents |
| `/api/branches` | Branch CRUD, rooms, cots, amenities, photos |
| `/api/complaints` | Complaint CRUD, status updates, assignment |
| `/api/vacate` | Vacate CRUD, financial settlement |
| `/api/dashboard` | Dashboard aggregations |
| `/api/master` | All master/lookup table CRUD |
| `/api/roles` | Role-page access management |
| `/api/service-providers` | Worker CRUD, categories |
| `/api/payments` | Payment gateway redirect and callback |
| `/api/invoices` | PDF invoice generation |
| `/api/upload` | File uploads |
| `/api/bulk-upload` | Excel bulk import |
| `/api/notifications` | Notification management |

## Key Relationships

```
Branch
 └── Rooms (1:N)
      └── Cots (1:N)
           └── Admissions (1:N)
                ├── Candidate (N:1)
                ├── Payment Details (1:N)
                ├── Payment Schedule (1:N)
                ├── Vacate (1:N)
                └── Feedback (1:N)

Complaint
 ├── Branch, Room, Cot (location)
 ├── Issue Category → Subcategory (classification)
 ├── Candidate or Manager (reporter)
 ├── Service Provider (assignee)
 └── Status lifecycle with timestamps

User (Admin/Manager)
 ├── Role → Page Access (RBAC)
 └── Branch assignment
```

## License

Proprietary. All rights reserved.
