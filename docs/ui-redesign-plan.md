# Hostel ERP — Enterprise UI Redesign Specification

> **Version**: 2.0
> **Scope**: Complete visual and structural overhaul of the Admin portal
> **Backend**: Zero changes — same routes, same APIs, same models
> **Design references**: Stripe Dashboard, Linear, Vercel Geist, SAP Fiori Horizon, IBM Carbon, Cloudbeds PMS, Ant Design Pro
> **Goal**: Transform a ported ladies-hostel prototype into a production-grade property operations platform

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Design System Foundation](#2-design-system-foundation)
3. [Layout Architecture](#3-layout-architecture)
4. [Shared Component Library](#4-shared-component-library)
5. [Login & Authentication](#5-login--authentication)
6. [Dashboard](#6-dashboard)
7. [Core Operations Pages](#7-core-operations-pages)
8. [People & Management Pages](#8-people--management-pages)
9. [Configuration / Master Data Pages](#9-configuration--master-data-pages)
10. [Phase Execution Order](#10-phase-execution-order)
11. [File Inventory](#11-file-inventory)
12. [Verification Checklist](#12-verification-checklist)

---

## 1. Current State Audit

### Exact files and what they contain today

**Theme & Styles**
- `src/providers/AppThemeProvider.tsx` — MUI theme: `primary: #F76D61` (salmon), `secondary: #000`, font `Nunito`, ripple disabled
- `src/assets/scss/variables.scss` — `$primary: #F76D61`, `$success: #18bf05`, `$warning: #EEC808`, `$danger: #ef3d18`, `$gray: #333333`
- `src/assets/scss/app.scss` — 876 lines. Imports Bootstrap via `@import "bootstrap"`. Imports Google Fonts Nunito. Contains all global utility classes (`.fs12`–`.fs18`, `.statusBgActive`, `.statusInProgress`, `.statusResolved`, `.statusRejected`, `.statusHold`, `.nav-link`, `.mob-nav-link`, `.subMenu`, `.tableBorder`, `.fieldBorder`, `.signUpcard`, `.complaintFeild`, `.dashboardContent`, media queries)

**Layout**
- `src/components/layouts/dashboardLayout.tsx` — 43 lines. Renders `<DashboardNewHeader />` + `<Outlet />` on white background. Fetches `getRolePageAccessByRoleId` on mount
- `src/components/layouts/dashboardNewHeader.tsx` — 370 lines. Horizontal salmon-colored top bar with icon+text nav items. Uses `CustomAbsoluteBox` for dropdown menus (Admission, Master, User). Mobile uses MUI `Drawer` with `#FFF7E9` background. All navigation hardcoded inline
- `src/components/layouts/authLayout.tsx` — 32 lines. Full-viewport background image (`Logn Background.png`), centered white card (`.signUpcard`), Bootstrap layout

**State Management**
- `src/providers/StateProvider.tsx` — Context + useReducer. Exports `StateContext`, `StateProvider`, `useStateValue`
- `src/services/StateReducer.ts` — 4 actions: `SET_USER`, `SET_BRANCH_DETAILS`, `SET_ADMISSION_DETAILS`, `PAGE_ACCESS`. Initial state: `{ user, branchDetails: null, admissionDetails: null, pageAccess: null }`

**Routing** (`src/routes/RouteApp.tsx`)
- 30+ lazy-loaded routes nested under `<DashboardLayout />`
- Each route wraps in `<Suspense>` with `checkPageAccess()` guard
- Route constants from `src/configs/constants.ts`

**Route constants** (`src/configs/constants.ts`)
- `ROUTES.HOME.DASHBOARD` → `/dashboard`
- `ROUTES.HOME.COMPLAINTS` → `/complaints`
- `ROUTES.HOME.ADMISSION.LIST` → `/admission/admission-list`
- `ROUTES.HOME.ADMISSION.CONFIRMATION` → `/admission/admission-confirmation`
- `ROUTES.HOME.ADMISSION.TRANSFER` → `/admission/admission-transfer`
- `ROUTES.HOME.ADMISSION.PAYMENTS` → `/admission/candidate-payments`
- `ROUTES.HOME.ADMISSION.EB_CHARGES` → `/admission/eb-charges`
- `ROUTES.HOME.BRANCH` → `/branch`
- `ROUTES.HOME.VACATE` → `/vacate`
- `ROUTES.HOME.FEEDBACK` → `/feedback`
- `ROUTES.HOME.BLACKLIST` → `/blacklist`
- `ROUTES.HOME.ATTENDANCE` → `/attendance`
- `ROUTES.HOME.ANNOUNCEMENTS` → `/announcements`
- `ROUTES.HOME.PAYMENT_STATUS` → `/payment-status`
- `ROUTES.HOME.MASTER.*` → `/master/amenities-category`, `/master/room-type`, etc. (13 master routes)
- `ROUTES.HOME.USER.ROLE` → `/user/user-page-access`
- `ROUTES.HOME.USER.LIST` → `/user/user-list`
- `ROUTES.HOME.USER.SERVICE_PROVIDER` → `/user/service-provider`
- `ROUTES.API.*` → 80+ API endpoint constants

**Helper Service** (`src/services/HelperService.ts`)
- `customTableTemplate` — `{ border: "none !important" }`
- `customTableHeader` — `{ backgroundColor: "#FAFAFA", borderRadius: '10px' }`
- `CustomTableHover` — hover `#f4908752` (salmon tint)
- `textFieldStyle` — Nunito font, `#F3F3F3` bg, `#bbbbbb` border, focus `#F76D61`
- `textFieldStyleLogin` — white bg, `#C7C3C3` border, focus `#1487eb`
- `customRadio` — checked color `#F76D61`
- **Keep**: `userSession`, `base64`, `formatDateToDisplay`, `CustomAlert`, `DisableKeyUpDown`, `getExportEXCEL`, `EncodeUnicode`, `DecodeUnicode`, `useQuery`

**Helper Components** (`src/components/helpers/`)
- `CustomSearch.tsx` — popup-style search with animation classes
- `CustomSelect.tsx` — exports `CustomSelect`, `CustomAutoSelect`, `CustomAutoMultiSelect`, `CustomFilterMultiSelect`
- `CustomDialogue.tsx` — exports `CustomDialogue`, `CustomSimpleDialogue`
- `CustomAbsoluteBox.tsx` — absolute-positioned click-outside container for dropdown menus
- `CustomSwitch.tsx` — toggle switch
- `DateRangeSelector.tsx` — date range with presets (Today, Last Week, Last Month, Current Month, Custom)
- `DragDropUpload.tsx` — drag-and-drop file upload
- `BulkUploadData.tsx` — Excel bulk upload
- `loader.tsx`, `PageLoading.tsx`, `NoAccess.tsx`, `ScrollToTop.tsx`

**Pages** (40+ files)
- `src/pages/home/index.tsx` — Dashboard with inline `DataCard` component, `DataCard` uses Bootstrap `col-md-3`, 4 sections (Payments, Bookings, Cots, Complaints), detail modals
- `src/pages/home/paymentStatus.tsx` — Payment gateway callback
- `src/pages/dashboardDetail/` — 4 modal components for drill-down (payments, bookings, cots, complaints)
- `src/pages/complaint/index.tsx` — Uses `customTableTemplate`, `customTableHeader`, `CustomTableHover`, `textFieldStyle`, `customRadio` from HelperService. 70+ state variables. Full CRUD with status workflow
- `src/pages/admissions/index.tsx` — Admission list with 7-step form wizard
- `src/pages/admissions/admissionConfirm.tsx` — Pending admission approval
- `src/pages/admissions/admissionTransfer.tsx` — Room/branch transfer
- `src/pages/admissions/candidatePayments.tsx` — Payment collection grid
- `src/pages/admissions/candidatePaymentDetails.tsx` — Per-candidate breakdown
- `src/pages/admissions/ebCharges.tsx` — Utility charges by room type
- `src/pages/admissions/components/` — 7 step components + `style.scss`
- `src/pages/branch/index.tsx` — Tab-based branch management
- `src/pages/branch/components/` — branchDetails, roomsAndCots, branchPhotos, branchAmenities
- `src/pages/vacate/index.tsx` — Checkout with financial settlement
- `src/pages/feedBack/index.tsx` — Feedback ratings grid
- `src/pages/blackList/index.tsx` — Blacklisted candidates
- `src/pages/userList/index.tsx` — Admin user CRUD
- `src/pages/userRolePageAccess/index.tsx` — RBAC permission matrix
- `src/pages/serviceProvider/index.tsx` — Worker management
- `src/pages/attendance/index.tsx` — Attendance tracking
- `src/pages/announcements/index.tsx` — Announcements
- `src/pages/master/` — 13 CRUD pages + `userRolePageAccess/index.tsx`
- `src/pages/notFound/index.tsx` + `style.scss` — 404 page
- `src/pages/auth/login.tsx` — OTP login form

### Problems to solve

| # | Problem | Impact |
|---|---------|--------|
| 1 | `#F76D61` salmon primary reads as casual/feminine — wrong tone for property operations software | Brand perception |
| 2 | Nunito is a rounded display font — poor readability for dense data tables at 12-14px | Usability |
| 3 | Horizontal top nav crams 10+ items into one row with `CustomAbsoluteBox` popup menus | Navigation fails at 30+ pages |
| 4 | Bootstrap (`@import "bootstrap"`) and MUI used simultaneously — two competing layout systems | Maintenance burden, bundle size |
| 5 | Every page rebuilds tables from scratch using `customTableTemplate` + `customTableHeader` + `SkeletonProviderTables` | Inconsistency, developer velocity |
| 6 | Dashboard is 16 plain `DataCard` components in Bootstrap grid — no charts, no trends, no actionable insights | Low information density |
| 7 | Status indicators are raw SCSS classes (`.statusInProgress`, `.statusResolved`) with inconsistent colors | Accessibility, confusion |
| 8 | Form fields use hardcoded `textFieldStyle` objects with salmon focus color | Visual inconsistency |
| 9 | Regional terminology (Cot, Vacate, EB Charges, Candidate, Black List) | Unprofessional for global use |
| 10 | No breadcrumbs, no command palette, no keyboard shortcuts | Productivity loss |

---

## 2. Design System Foundation

> **Reference**: IBM Carbon token architecture + Stripe accessible color system + Vercel Geist type scale
>
> **Principle**: Build the system as tokens first. Every color, font size, spacing value, and shadow is a named variable. No hardcoded values anywhere in component code.

### 2.1 Color Palette

**Approach**: Monochromatic neutral base + one primary accent + semantic status colors. This is how Stripe, Linear, and Vercel achieve a "premium but not flashy" look. The primary accent is used sparingly — only for interactive elements and active states.

#### Neutrals (Gray scale — used for 90% of the interface)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `gray.25` | `#FCFCFD` | 252,252,253 | Subtle hover on white surfaces |
| `gray.50` | `#F9FAFB` | 249,250,251 | Page background |
| `gray.100` | `#F2F4F7` | 242,244,247 | Card background, input bg, table header |
| `gray.200` | `#EAECF0` | 234,236,240 | Borders, dividers, table row borders |
| `gray.300` | `#D0D5DD` | 208,213,221 | Disabled borders, placeholder text |
| `gray.400` | `#98A2B3` | 152,162,179 | Placeholder text, disabled icons |
| `gray.500` | `#667085` | 102,112,133 | Secondary text, labels, captions |
| `gray.600` | `#475467` | 71,84,103 | Body text |
| `gray.700` | `#344054` | 52,64,84 | Strong body text |
| `gray.800` | `#1D2939` | 29,41,57 | Headings |
| `gray.900` | `#101828` | 16,24,40 | Sidebar bg, highest contrast text |

> **Why not Tailwind's slate?**: These are the Untitled UI / Shadcn gray scale — warmer than pure slate, tested across thousands of production SaaS apps. Pure slate (blue-tinted) can feel cold; this gray has a neutral warm undertone that reads as professional without being sterile.

#### Primary (Interactive accent)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary.25` | `#F5F8FF` | Selected row background, faint tint |
| `primary.50` | `#EFF4FF` | Active sidebar item bg, light badges |
| `primary.100` | `#D1E0FF` | Focus ring outer, tag backgrounds |
| `primary.200` | `#B2CCFF` | — |
| `primary.300` | `#84ADFF` | — |
| `primary.400` | `#528BFF` | — |
| `primary.500` | `#2970FF` | Links, primary buttons hover |
| `primary.600` | `#155EEF` | Primary buttons, active states, sidebar accent border |
| `primary.700` | `#004EEB` | Primary button pressed |
| `primary.800` | `#0040C1` | — |
| `primary.900` | `#00359E` | — |

> **Why `#155EEF`?**: It sits between IBM Carbon Blue-60 (`#0F62FE`) and Stripe's interactive blue (`#0570DE`). WCAG AA compliant on white (4.7:1). Saturated enough to read as interactive, not so vivid it overwhelms a data-dense screen.

#### Semantic Status Colors

| Status | Token | Dot/Icon | Badge BG | Badge Text | Border |
|--------|-------|----------|----------|------------|--------|
| Success / Active / Closed | `success` | `#12B76A` | `#ECFDF3` | `#027A48` | `#ABEFC6` |
| Warning / Pending / Hold | `warning` | `#F79009` | `#FFFAEB` | `#B54708` | `#FEDF89` |
| Error / Overdue / Rejected | `error` | `#F04438` | `#FEF3F2` | `#B42318` | `#FECDCA` |
| Info / In Progress | `info` | `#2E90FA` | `#EFF8FF` | `#175CD3` | `#B2DDFF` |
| Neutral / Draft / Inactive | `neutral` | `#667085` | `#F2F4F7` | `#344054` | `#EAECF0` |
| Purple / Maintenance | `purple` | `#7A5AF8` | `#F4F3FF` | `#5925DC` | `#D9D6FE` |

> **Rule**: Status colors are NEVER used as primary/interactive colors. They only appear in badges, dots, and notification contexts. This prevents the "christmas tree" effect common in poorly themed ERPs.

### 2.2 Typography

**Font**: `Inter` (variable, 400-700 weights)

> **Why Inter over Nunito?**: Inter was designed specifically for computer screens. It has:
> - Tabular (monospaced) number forms — critical for aligned columns in data tables
> - Distinctive letterforms at small sizes (capital I has serifs, lowercase l is disambiguated)
> - Optimized x-height for 11-14px rendering
> - Used by: GitHub, Figma, Linear, Vercel, Shopify Polaris

**Type Scale** (Major Third ratio — 1.25x):

| Token | Size | Weight | Line Height | Letter Spacing | Color | Usage |
|-------|------|--------|-------------|----------------|-------|-------|
| `display.sm` | 30px | 600 | 38px | -0.02em | `gray.900` | Page titles (Dashboard, Complaints) |
| `text.xl` | 20px | 600 | 30px | -0.01em | `gray.900` | Section headings, dialog titles |
| `text.lg` | 18px | 600 | 28px | 0 | `gray.800` | Card titles, sub-headings |
| `text.md` | 14px | 400/500 | 20px | 0 | `gray.700` | Body text, table cells, input values |
| `text.sm` | 13px | 400/500 | 18px | 0 | `gray.600` | Secondary text, descriptions |
| `text.xs` | 12px | 500 | 18px | 0 | `gray.500` | Labels, table headers, captions, timestamps |
| `text.xxs` | 11px | 500 | 16px | 0.02em | `gray.500` | Badge text, overline labels |

**Numeric display**: Use `font-variant-numeric: tabular-nums` on all table cells and stat cards. This ensures numbers align vertically in columns (e.g. "1,234" and "89" line up at the comma).

### 2.3 Spacing

**Base unit**: 4px. All spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.1` | 4px | Tight inline gaps (icon-to-text in badges) |
| `spacing.2` | 8px | Compact gaps (between badge and text) |
| `spacing.3` | 12px | Input internal padding, compact card padding |
| `spacing.4` | 16px | Standard gap between form fields, card padding |
| `spacing.5` | 20px | Section padding in dialogs |
| `spacing.6` | 24px | Content area padding, page margin |
| `spacing.8` | 32px | Large section gaps |
| `spacing.10` | 40px | Page header bottom margin |
| `spacing.12` | 48px | Between major page sections |
| `spacing.16` | 64px | Top-of-page breathing room |

### 2.4 Elevation & Borders

| Token | Value | Usage |
|-------|-------|-------|
| `shadow.xs` | `0px 1px 2px rgba(16,24,40,0.05)` | Input fields, subtle cards |
| `shadow.sm` | `0px 1px 3px rgba(16,24,40,0.1), 0px 1px 2px rgba(16,24,40,0.06)` | Cards, dropdowns |
| `shadow.md` | `0px 4px 8px -2px rgba(16,24,40,0.1), 0px 2px 4px -2px rgba(16,24,40,0.06)` | Popovers, elevated cards |
| `shadow.lg` | `0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)` | Modals, dialogs |
| `shadow.xl` | `0px 20px 24px -4px rgba(16,24,40,0.08), 0px 8px 8px -4px rgba(16,24,40,0.03)` | Command palette overlay |
| `radius.sm` | 6px | Inputs, small buttons |
| `radius.md` | 8px | Cards, dialogs, badges |
| `radius.lg` | 12px | Large cards, modals |
| `radius.xl` | 16px | Login card, onboarding panels |
| `radius.full` | 9999px | Pills, avatar circles, status dots |
| `border.primary` | `1px solid #EAECF0` | Default border (gray.200) |
| `border.heavy` | `1px solid #D0D5DD` | Active/focus border (gray.300) |

### 2.5 MUI Theme Overrides

**Every MUI component** gets re-themed via `createTheme()`. No inline `sx` for styling that should be systemic.

```
MuiButton:
  - borderRadius: 8px
  - fontWeight: 600
  - fontSize: 14px
  - padding: '10px 18px' (md), '8px 14px' (sm)
  - textTransform: 'none'
  - boxShadow: shadow.xs
  - contained primary: bg primary.600, hover primary.700, active primary.800
  - outlined: border gray.300, text gray.700, hover bg gray.50
  - text: text gray.600, hover bg gray.50

MuiTextField / MuiOutlinedInput:
  - borderRadius: 8px
  - border: 1px solid gray.300
  - backgroundColor: white
  - fontSize: 14px (text.md)
  - padding: '10px 14px'
  - hover: border gray.400
  - focused: border primary.300, ring 4px primary.100
  - placeholder: gray.400
  - label: gray.700, fontSize 14px, fontWeight 500

MuiTableContainer:
  - backgroundColor: white
  - borderRadius: 12px
  - border: 1px solid gray.200
  - boxShadow: shadow.sm
  - overflow: hidden (corners clip rows)

MuiTableHead:
  - backgroundColor: gray.50
  - borderBottom: 1px solid gray.200

MuiTableCell (head):
  - fontSize: 12px
  - fontWeight: 500
  - color: gray.500
  - padding: '12px 24px'  (first/last: '12px 24px')
  - textTransform: none (NOT uppercase — Stripe/Linear don't uppercase headers)
  - letterSpacing: 0
  - whiteSpace: nowrap

MuiTableCell (body):
  - fontSize: 14px
  - fontWeight: 400
  - color: gray.600
  - padding: '16px 24px'
  - borderBottom: 1px solid gray.200
  - fontVariantNumeric: 'tabular-nums'

MuiTableRow:
  - '&:hover': backgroundColor gray.25
  - transition: background-color 150ms ease
  - '&:last-child td': borderBottom 0

MuiCard:
  - backgroundColor: white
  - borderRadius: 12px
  - border: 1px solid gray.200
  - boxShadow: 'none' (border replaces shadow — cleaner in dense layouts)
  - padding: 24px

MuiChip (status badge):
  - borderRadius: 16px (pill shape)
  - fontSize: 12px
  - fontWeight: 500
  - height: 24px
  - Variants mapped to semantic colors (see StatusBadge component)

MuiDialog:
  - borderRadius: 12px
  - padding: 0
  - '.MuiDialogTitle-root': padding '20px 24px', fontSize 18px, fontWeight 600
  - '.MuiDialogContent-root': padding '0 24px 20px'
  - '.MuiDialogActions-root': padding '16px 24px', borderTop '1px solid gray.200'
  - backdropFilter: 'blur(4px)' (frosted glass backdrop — Linear-style)

MuiTab:
  - textTransform: 'none'
  - fontWeight: 500
  - fontSize: 14px
  - color: gray.500
  - '&.Mui-selected': color gray.800, fontWeight 600
  - indicator: height 2px, primary.600

MuiPagination:
  - '.MuiPaginationItem-root': borderRadius 8px, fontSize 14px
  - '&.Mui-selected': bg primary.50, color primary.700, fontWeight 600

MuiSelect:
  - Same border/bg/radius treatment as TextField

MuiDrawer:
  - For sidebar: bg gray.900, color white

MuiSkeleton:
  - borderRadius: 8px
  - backgroundColor: gray.100
  - animation: pulse (not wave — pulse is less distracting for enterprise use)
```

### 2.6 Files to Create / Modify

| File | Action | What goes in it |
|------|--------|----------------|
| `src/theme/tokens.ts` | **CREATE** | All color, spacing, shadow, radius, typography tokens as exported constants |
| `src/theme/palette.ts` | **CREATE** | MUI `PaletteOptions` built from tokens |
| `src/theme/typography.ts` | **CREATE** | MUI `TypographyOptions` with Inter, all variants |
| `src/theme/components.ts` | **CREATE** | All `MuiButton`, `MuiTextField`, `MuiTable*`, `MuiCard`, `MuiChip`, `MuiDialog`, `MuiTab`, `MuiPagination`, `MuiSelect`, `MuiDrawer`, `MuiSkeleton` overrides |
| `src/theme/index.ts` | **CREATE** | `createTheme()` combining palette + typography + components. Single export |
| `src/providers/AppThemeProvider.tsx` | **MODIFY** | Delete inline theme. Import from `src/theme`. Add `<CssBaseline />` |
| `src/assets/scss/variables.scss` | **MODIFY** | Replace all salmon/Bootstrap variables. New: `$page-bg: #F9FAFB`, `$sidebar-bg: #101828`, `$sidebar-width: 260px`, `$sidebar-width-collapsed: 72px`, `$header-height: 56px` |
| `src/assets/scss/app.scss` | **MODIFY** | Remove `@import "bootstrap"`. Remove Nunito import. Add Inter import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`. Gut all Bootstrap-dependent classes. Keep minimal reset + scrollbar styles + swal z-index fix. Replace `.statusInProgress` etc. with nothing (handled by StatusBadge component). Replace `.nav-link` etc. with nothing (handled by Sidebar component) |
| `src/assets/scss/layout.scss` | **CREATE** | Sidebar, header, content area positioning styles |
| `src/assets/scss/utilities.scss` | **CREATE** | Minimal utilities: `.truncate`, `.tabular-nums`, `.required::after` |
| `client/package.json` | **MODIFY** | Remove `bootstrap` from dependencies. Add `recharts: ^2.12.0` |
| `client/index.html` | **MODIFY** | Preconnect to Google Fonts for Inter |

---

## 3. Layout Architecture

> **Reference**: Vercel dashboard (sidebar + top bar), Linear (collapsible rail), Cloudbeds (search-first header)
>
> **Replace**: The 370-line `dashboardNewHeader.tsx` horizontal nav with a proper sidebar + slim header architecture.

### 3.1 Layout Structure

```
+---+----------------------------------------------------------+
|   | [=] Hostel ERP           [Cmd+K Search]  [Bell] [JD ▾]   | 56px TopHeader
|   +----------------------------------------------------------+
|   | Dashboard  >  Overview                                    | 40px Breadcrumb bar
| S +----------------------------------------------------------+
| I |                                                          |
| D |   [ Page content rendered by <Outlet /> ]                |
| E |                                                          |
| B |   Content area scrolls independently.                    |
| A |   Sidebar and header are fixed.                          |
| R |                                                          |
|   |                                                          |
| 2 |                                                          |
| 6 |                                                          |
| 0 |                                                          |
| p |                                                          |
| x |                                                          |
+---+----------------------------------------------------------+
```

**Sidebar**: Fixed left, full viewport height, `gray.900` background, white text.
**TopHeader**: Fixed top, spans viewport minus sidebar width, `white` background, `gray.200` bottom border.
**Content area**: Below header, right of sidebar. Scrollable. Background `gray.50`. Padding `24px`.

### 3.2 Sidebar Navigation Config

The sidebar is data-driven from `src/configs/navigation.ts`. Each item maps to an existing `ROUTES.HOME.*` constant and the existing `pageAccess` RBAC check.

```
Section: OVERVIEW
  ├─ Dashboard                    icon: LayoutDashboard     path: ROUTES.HOME.DASHBOARD

Section: OPERATIONS
  ├─ Admissions (group, expandable)   icon: UserPlus
  │   ├─ All Admissions                                     path: ROUTES.HOME.ADMISSION.LIST
  │   ├─ Confirmation                                       path: ROUTES.HOME.ADMISSION.CONFIRMATION
  │   ├─ Transfer                                           path: ROUTES.HOME.ADMISSION.TRANSFER
  │   ├─ Resident Payments                                  path: ROUTES.HOME.ADMISSION.PAYMENTS
  │   └─ Utility Charges                                    path: ROUTES.HOME.ADMISSION.EB_CHARGES
  ├─ Complaints                   icon: AlertCircle         path: ROUTES.HOME.COMPLAINTS
  ├─ Checkout                     icon: LogOut              path: ROUTES.HOME.VACATE
  └─ Branches                     icon: Building2           path: ROUTES.HOME.BRANCH

Section: PEOPLE
  ├─ Users & Access (group)       icon: Shield
  │   ├─ User Directory                                     path: ROUTES.HOME.USER.LIST
  │   ├─ Role Permissions                                   path: ROUTES.HOME.USER.ROLE
  │   └─ Service Providers                                  path: ROUTES.HOME.USER.SERVICE_PROVIDER
  ├─ Restricted Residents         icon: Ban                 path: ROUTES.HOME.BLACKLIST
  ├─ Feedback                     icon: MessageSquare       path: ROUTES.HOME.FEEDBACK
  ├─ Attendance                   icon: CalendarCheck       path: ROUTES.HOME.ATTENDANCE
  └─ Announcements                icon: Megaphone           path: ROUTES.HOME.ANNOUNCEMENTS

Section: CONFIGURATION
  └─ Master Data (group)          icon: Settings
      ├─ Room Types                                         path: ROUTES.HOME.MASTER.ROOM_TYPE
      ├─ Bed Types                                          path: ROUTES.HOME.MASTER.COT_TYPE
      ├─ Sharing Types                                      path: ROUTES.HOME.MASTER.SHARING_TYPE
      ├─ Bathroom Types                                     path: ROUTES.HOME.MASTER.BATHROOM_TYPE
      ├─ Amenity Categories                                 path: ROUTES.HOME.MASTER.AMENITIES_CATEGORIES
      ├─ Amenity Sub-Categories                             path: ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES
      ├─ Amenity Facilities                                 path: ROUTES.HOME.MASTER.AMENITIES_FACILITIES
      ├─ Issue Categories                                   path: ROUTES.HOME.MASTER.ISSUE_CATEGORIES
      ├─ Issue Sub-Categories                               path: ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES
      ├─ Page Registry                                      path: ROUTES.HOME.MASTER.PAGE_LIST
      ├─ User Roles                                         path: ROUTES.HOME.MASTER.MASTER_USER_ROLE
      ├─ Provider Categories                                path: ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY
      └─ Bulk Import                                        path: ROUTES.HOME.MASTER.BULK_UPLOAD
```

**Icons**: Use `lucide-react` (or MUI Icons equivalents). Line-weight icons, not filled — consistent with Linear/Vercel aesthetic.

### 3.3 Sidebar Behavior

| Viewport | Behavior |
|----------|----------|
| Desktop ≥ 1280px | Full sidebar (260px). Toggle button collapses to 72px icon rail with tooltips on hover. Collapse state saved in `localStorage` + reducer |
| Tablet 768–1279px | Starts collapsed (72px icon rail). Expand on toggle click. Overlay not needed — rail always visible |
| Mobile < 768px | Sidebar hidden. Hamburger icon in TopHeader opens MUI Drawer (full overlay, slide from left, `gray.900` background, same nav items) |

**Active item styling**:
- Left border: 3px solid `primary.600`
- Background: `rgba(255,255,255,0.08)` (subtle white overlay on dark sidebar)
- Text: `white`, fontWeight 600
- Icon: `white` (vs `gray.400` for inactive)

**Group expand/collapse**:
- Chevron icon rotates 90° on expand (transition 200ms)
- Children indented 12px from parent
- Active child highlights parent group label

**Section headers** (OVERVIEW, OPERATIONS, etc.):
- `text.xxs` (11px), fontWeight 600, uppercase, `gray.400` color, `letterSpacing: 0.06em`
- Margin-top: 24px (except first section)
- In collapsed rail mode: section headers hidden

### 3.4 TopHeader (56px)

```
[Hamburger/Collapse] [Logo: Hostel ERP]          [Search] [Notifications] [Avatar + Name ▾]
```

- Left: Sidebar toggle button (hamburger icon on mobile, collapse-arrows on desktop)
- Left: Logo text "Hostel ERP" in `text.lg` weight 700 (only visible when sidebar is collapsed, since expanded sidebar has its own logo)
- Center/Right: Search trigger button — `Cmd+K` / `Ctrl+K` hint text, gray.300 border pill. Clicking opens a command palette overlay (Phase 2 component)
- Right: Notification bell icon with unread dot (red, 8px)
- Right: User avatar (32px circle) + first name + chevron down. Click opens dropdown menu

**UserMenu dropdown** (replaces `CustomAbsoluteBox` + `_menuPopup`):
- MUI `Menu` anchored to avatar
- Items: "Profile" (disabled/future), divider, "Logout" (red text)
- Width: 200px, shadow.lg, radius.lg

### 3.5 Breadcrumbs (40px bar)

- Position: Below TopHeader, above content area
- Background: `white`, border-bottom: `1px solid gray.200`
- Padding: `8px 24px`
- Auto-generated from current route path
- Example: `Dashboard` (for `/dashboard`), `Admissions > All Admissions` (for `/admission/admission-list`), `Configuration > Master Data > Room Types` (for `/master/room-type`)
- Use route-to-label mapping from `navigation.ts` config
- Last item is not a link, just text in `gray.800`
- Parent items are links in `gray.500`, hover `primary.600`

### 3.6 Terminology Cleanup

> These are UI-facing label changes only. API field names, database column names, and route paths remain UNCHANGED.

| Old Label (UI text only) | New Label | Where it appears |
|--------------------------|-----------|-----------------|
| Candidate | Resident | Sidebar nav, page titles, table headers, form labels, dialog titles |
| Cot | Bed | Sidebar nav, page titles, table headers, branch detail tabs |
| Vacate | Checkout | Sidebar nav, page title, buttons, dialog titles |
| Black List | Restricted Residents | Sidebar nav, page title |
| EB Charges | Utility Charges | Sidebar nav, page title |
| Master | Configuration / Master Data | Sidebar section label |
| Add New Admission | Register Resident | Button text |
| Candidate Payments | Resident Payments | Sidebar nav, page title |
| Page List | Page Registry | Sidebar nav, page title |
| Cot Type | Bed Types | Sidebar nav, page title |
| Data Not Found | No records found | Empty state message |
| Service Provider | Service Provider (keep) | — |

**IMPORTANT**: Variable names in code (`_candidateDetails`, `candidateRefId`, `cotRefId`, etc.) do NOT change. Only user-facing strings in JSX change.

### 3.7 Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/configs/navigation.ts` | **CREATE** | Sidebar nav config array with sections, groups, items, icons, paths, labels |
| `src/components/layout/Sidebar.tsx` | **CREATE** | Dark sidebar: logo area, scrollable nav sections, collapse toggle, renders SidebarItem/SidebarGroup. Reads `sidebarCollapsed` from state |
| `src/components/layout/SidebarItem.tsx` | **CREATE** | Single nav item: icon, label, active indicator, tooltip when collapsed. Uses `NavLink` from react-router |
| `src/components/layout/SidebarGroup.tsx` | **CREATE** | Expandable group: parent item with chevron, renders children SidebarItems. Tracks open/closed in local state. Auto-opens if a child route is active |
| `src/components/layout/TopHeader.tsx` | **CREATE** | 56px fixed header: collapse button, logo (when sidebar collapsed), search trigger, notification bell, UserMenu |
| `src/components/layout/Breadcrumbs.tsx` | **CREATE** | Auto-generated from `useLocation()` + navigation config lookup. Maps path segments to labels |
| `src/components/layout/ContentArea.tsx` | **CREATE** | Wrapper `<Box>` with gray.50 background, 24px padding, `overflow-y: auto`, `height: calc(100vh - 56px - 40px)` |
| `src/components/layout/AppShell.tsx` | **CREATE** | Composes: Sidebar + TopHeader + Breadcrumbs + ContentArea wrapping `<Outlet />`. Handles responsive sidebar mode |
| `src/components/layout/UserMenu.tsx` | **CREATE** | MUI Menu anchored to avatar with profile info + logout action |
| `src/components/layouts/dashboardLayout.tsx` | **MODIFY** | Replace `<DashboardNewHeader /> + <Outlet />` with `<AppShell />`. Keep RBAC fetch logic |
| `src/components/layouts/dashboardNewHeader.tsx` | **DELETE** | Entirely replaced by Sidebar + TopHeader |
| `src/components/layouts/authLayout.tsx` | **MODIFY** | Replace background image approach with CSS gradient: `linear-gradient(135deg, #101828 0%, #1D2939 100%)`. Replace Bootstrap centering with MUI `Box` + flexbox. Card: white, radius.xl, shadow.xl, max-width 440px |
| `src/providers/StateProvider.tsx` | **MODIFY** | No structural change. Initial state shape stays the same (the reducer handles new actions) |
| `src/services/StateReducer.ts` | **MODIFY** | Add: `sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true'` to initialState. Add `TOGGLE_SIDEBAR` action that flips boolean and persists to localStorage |

---

## 4. Shared Component Library

> **Principle**: Every page should compose from the same building blocks. No page should import raw `<Table>`, `<TableHead>`, `<TableRow>`, `<TableCell>` from MUI — they use `<DataTable>` instead. No page should construct its own page title layout — they use `<PageHeader>`.

### 4.1 Component Specifications

#### `shared/DataTable.tsx`

**Replaces**: Raw MUI Table + `customTableTemplate` + `customTableHeader` + `CustomTableHover` + `SkeletonProviderTables` + "Data Not Found" pattern repeated in every page

**Props**:
```typescript
interface Column<T> {
  id: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;        // default 5
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;           // default "No records found"
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string | number;
  // Pagination (server-side)
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (size: number) => void;
  stickyHeader?: boolean;
}
```

**Renders**:
- MUI `TableContainer` + `Table` + `TableHead` + `TableBody` (all styled via theme overrides, no inline sx needed)
- Loading state: `skeletonRows` rows of `<Skeleton>` matching column widths
- Empty state: `<EmptyState>` component centered in table body
- Pagination: MUI `Pagination` + rows-per-page select below table, only when `totalCount` is provided
- Row hover: `gray.25` background transition
- Responsive: horizontal scroll via `overflow-x: auto` on container

#### `shared/PageHeader.tsx`

**Replaces**: The `<div className="fw-bold row justify-content-between align-items-center">` + `<div className="fs18">Title</div>` pattern at the top of every page

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;  // Action buttons slot (right-aligned)
}
```

**Renders**:
- Title: `display.sm` (30px, 600 weight, gray.900)
- Description: `text.sm` (13px, gray.500), 4px below title
- Actions slot: flex row, gap 12px, right-aligned
- Bottom margin: 24px

#### `shared/FilterBar.tsx`

**Replaces**: Repeated branch/date/status filter rows using Bootstrap `col-md-*` classes

**Props**:
```typescript
interface FilterBarProps {
  children: React.ReactNode;  // Filter elements as children
}
```

**Renders**:
- Horizontal flex row, gap 12px, wrap, align-items center
- Background: white, padding 16px, border-radius 8px, border 1px gray.200
- Margin-bottom: 16px
- On mobile: stacks vertically

#### `shared/StatusBadge.tsx`

**Replaces**: `.statusBgActive`, `.statusInProgress`, `.statusResolved`, `.statusRejected`, `.statusHold` CSS classes

**Props**:
```typescript
interface StatusBadgeProps {
  status: string;  // Raw status string from API (e.g. "Open", "InProgress", "Closed", "Reject", "Hold", "Active", "Inactive", "Approved", "Pending")
  size?: 'sm' | 'md';
}
```

**Status → Color mapping**:
```
Active, Approved, Closed, Confirmed, Paid  →  success (green)
Pending, Hold, Partial                      →  warning (amber)
Open, Rejected, Reject, Overdue, Cancelled  →  error (red)
InProgress, In Progress, Inprogress, Booked →  info (blue)
Inactive, Draft                             →  neutral (gray)
Maintenance                                 →  purple
```

**Renders**: MUI `Chip` with:
- 8px colored dot (left)
- Label text (sentence case, e.g. "In Progress" not "InProgress")
- Background: semantic surface color
- Text: semantic text color
- Border: 1px semantic border color
- Height: 24px (sm) / 28px (md)
- No delete icon, not clickable

#### `shared/StatsCard.tsx`

**Replaces**: Inline `DataCard` component in `src/pages/home/index.tsx`

**Props**:
```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  accentColor?: string;
  loading?: boolean;
  onClick?: () => void;
}
```

**Renders**:
- Card with border (gray.200), no shadow, radius 12px, padding 20px
- Top row: icon (40px circle with accent background tint) + label (text.sm, gray.500)
- Value: display.sm (30px), gray.900, `tabular-nums`
- Trend (optional): small arrow icon + percentage text, green/red based on direction
- Hover: shadow.sm transition, cursor pointer if onClick provided
- Loading: Skeleton for value and trend

#### `shared/SearchInput.tsx`

**Replaces**: `CustomSearch.tsx` (popup-based with animation classes)

**Props**:
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;  // default 300
}
```

**Renders**:
- Always visible (not popup)
- MUI TextField with search icon on left, clear (X) button on right when value is non-empty
- Width: 280px on desktop, full-width on mobile
- Debounced onChange

#### `shared/SelectField.tsx`

**Wraps**: `CustomSelect`, `CustomAutoSelect` from current helpers. Re-exports them with consistent theme styling applied via theme overrides (no additional wrapper needed if theme overrides are complete).

Actually — keep the existing `CustomSelect.tsx`, `CustomAutoSelect`, `CustomAutoMultiSelect`, `CustomFilterMultiSelect` components as-is. They are functional. The theme overrides will restyle them automatically. Just remove any inline `sx` that conflicts with the new theme.

#### `shared/DateRangeFilter.tsx`

**Wraps**: `DateRangeSelector.tsx`. Keep existing component, re-export. Theme overrides handle restyling.

#### `shared/FormField.tsx`

**Replaces**: The repeated pattern of `<div className="text-muted fs14">Label</div> <TextField sx={textFieldStyle} ... />`

**Props**:
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;  // The actual input (TextField, Select, DatePicker, etc.)
}
```

**Renders**:
- Label: `text.xs` (12px), fontWeight 500, gray.700, margin-bottom 6px
- Required: red asterisk after label
- Children rendered as-is (the input)
- Error: text.xs, error.600 color, margin-top 4px
- Helper: text.xs, gray.500, margin-top 4px

#### `shared/DialogModal.tsx`

**Wraps**: `CustomDialogue.tsx`. Keep the existing component, update it to use theme overrides for radius/padding/title. The MUI Dialog theme override handles most of the restyling. Modify `CustomDialogue.tsx` to:
- Remove any inline border-radius overrides
- Use `text.xl` (20px semibold) for title
- Add `dividers` prop to MUI `DialogContent` for visual separation
- Add proper action footer with right-aligned buttons

#### `shared/ConfirmDialog.tsx`

**Replaces**: SweetAlert2 `Swal.fire({ icon: 'warning', showCancelButton: true, ... })` confirmation pattern

**Props**:
```typescript
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;       // default "Confirm"
  cancelLabel?: string;        // default "Cancel"
  variant?: 'danger' | 'default';  // danger = red confirm button
  loading?: boolean;
}
```

> **Note**: Keep `CustomAlert` toast from HelperService (SweetAlert2 toast). Only replace the confirmation dialogs, not the toast notifications. SweetAlert2 toasts are fine for success/error notifications.

#### `shared/EmptyState.tsx`

**Replaces**: `<TableCell colSpan={N}>Data Not Found</TableCell>` pattern

**Props**:
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;       // default "No records found"
  description?: string;
  action?: React.ReactNode;  // Optional button
}
```

**Renders**: Centered column: 48px muted icon + title (text.md, gray.800) + description (text.sm, gray.500) + action button. Padding 48px vertical.

#### `shared/ExportButton.tsx`

**Replaces**: Inline download icon buttons scattered across pages

**Props**:
```typescript
interface ExportButtonProps {
  onExport: () => void;
  label?: string;      // default "Export"
  loading?: boolean;
}
```

**Renders**: MUI Button (outlined variant), download icon, "Export" text. Calls existing `getExportEXCEL()` from HelperService.

#### `shared/MasterCrudPage.tsx`

**Replaces**: 13 nearly-identical master pages that each have ~200-400 lines of duplicated grid + dialog + form logic

**Props**:
```typescript
interface MasterCrudPageProps<T> {
  title: string;
  description: string;
  columns: Column<T>[];
  formFields: FormFieldConfig[];
  apiGet: (query?: string) => Promise<any>;
  apiSave: (data: any) => Promise<any>;
  apiDelete?: (id: number) => Promise<any>;
  transformRow?: (row: any) => T;
}
```

**Renders**: Full page with PageHeader + DataTable + DialogModal with form. Handles: loading state, pagination, create, edit, toggle active/inactive, delete, success/error toasts. Each master page file becomes ~30-50 lines of config instead of ~300 lines of duplicated logic.

#### `shared/FileUpload.tsx`

**Wraps**: `DragDropUpload.tsx`. Keep existing, restyle via CSS to match new tokens (gray borders, primary accent on drag-over, proper radius).

#### `shared/LoadingOverlay.tsx`

**Props**: `{ visible: boolean; fullPage?: boolean }`

**Renders**: Semi-transparent gray.900/40% overlay with centered circular progress. For inline loading within cards/sections.

#### `shared/index.ts`

Barrel export of all shared components.

### 4.2 Files to Modify in HelperService

**`src/services/HelperService.ts`** — MODIFY:
- **DELETE** these exports (replaced by theme overrides): `customTableTemplate`, `customTableHeader`, `CustomTableHover`, `textFieldStyle`, `textFieldStyleLogin`, `textFieldStyleAssignedby`, `customRadio`
- **KEEP** these exports (still used): `userSession`, `useQuery`, `base64`, `formatDateToDisplay`, `CustomAlert`, `DisableKeyUpDown`, `getExportEXCEL`, `EncodeUnicode`, `DecodeUnicode`

**`src/providers/SkeletonProvider.tsx`** — MODIFY:
- Update colors to use theme tokens
- `SkeletonProviderTables` is absorbed into `DataTable` component's loading state, but keep the export for backward compatibility during migration

**`src/components/helpers/CustomAbsoluteBox.tsx`** — **DELETE** after Phase 3:
- Only used in `dashboardNewHeader.tsx` for dropdown menus
- Sidebar groups and MUI Menu replace all use cases

### 4.3 New dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^2.12.0 | Dashboard donut and bar charts |
| `lucide-react` | ^0.400.0 | Line-weight icon set for sidebar nav (consistent with Linear/Vercel aesthetic). Optional — can use MUI Icons instead if preferred |

**Remove**: `bootstrap` from `client/package.json`

---

## 5. Login & Authentication

> **Reference**: Vercel login (dark gradient background, centered white card, minimal fields)

### 5.1 Auth Layout (`authLayout.tsx`)

**Current**: Background image (`Logn Background.png`), Bootstrap `container-fluid`, `.signUpcard` class (450x545px hardcoded)

**New**:
- Background: `linear-gradient(135deg, #101828 0%, #1D2939 50%, #0F1728 100%)` — dark charcoal gradient, no image dependency
- Optional: subtle grid pattern overlay using CSS (`background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px`)
- Centered card using MUI `Box` with `display: flex`, `alignItems: center`, `justifyContent: center`, `minHeight: 100vh`
- Card: `maxWidth: 440px`, `width: 100%`, background white, `borderRadius: 16px` (radius.xl), `boxShadow: shadow.xl`, `padding: 40px`

### 5.2 Login Page (`login.tsx`)

**Current**: Bootstrap classes for layout, salmon-focused styling

**New design** (top to bottom inside the card):
1. Logo (centered) — replace salmon logo with neutral/dark logo
2. Title: "Sign in to your account" — `text.xl`, gray.900, centered
3. Subtitle: "Enter your email to receive an OTP" — `text.sm`, gray.500, centered
4. Email field: full-width `TextField` with `FormField` wrapper, label "Email address"
5. "Request OTP" button: full-width, primary, `height: 44px`
6. OTP input (visible after OTP sent): 6 digit boxes — keep `react-otp-input`, style inputs to match: `width: 48px`, `height: 48px`, `borderRadius: 8px`, `border: 1px solid gray.300`, `fontSize: 20px`, `fontWeight: 600`, centered text. Focus: `border: 2px solid primary.600`, `boxShadow: 0 0 0 4px primary.100`
7. "Verify OTP" button: full-width, primary
8. Resend link: `text.sm`, `primary.600`, centered below button

---

## 6. Dashboard

> **Reference**: Cloudbeds dashboard (today's operations), Stripe dashboard (revenue KPIs), SAP Fiori (card-based overviews)

### 6.1 Current State

`src/pages/home/index.tsx` currently renders:
- Inline `DataCard` component using Bootstrap `col-md-3`
- 4 sections: PAYMENTS (4 cards), BOOKINGS (5 cards), COTS (5 cards), COMPLAINTS (5 cards)
- Each card shows a label + number, uses `.fontGreen`, `.fontBlue`, `.fontRed`, `.fontOrange` classes
- Branch filter via `CustomFilterMultiSelect`, date range via `DateRangeSelector`
- Click on any card opens a modal (DashboardPaymentsDetailModal, etc.)
- No charts, no trends, no visual hierarchy

### 6.2 New Dashboard Layout

```
+------------------------------------------------------------------+
| Dashboard                              [Branch ▾]  [Date Range]   |  PageHeader
| Today's overview of hostel operations                             |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------+ +-------------+ +-------------+ +-------------+  |  KPI Row
|  | Total Beds  | | Occupancy   | | Revenue     | | Open Issues |  |
|  | 248         | | 72%         | | ₹4.2L       | | 14          |  |  StatsCard x4
|  | 12 vacant   | | +5% vs last | | +8% MoM     | | 3 urgent    |  |
|  +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                    |
|  +---------------------------+ +---------------------------+      |  Charts Row
|  | Bed Occupancy             | | Revenue Breakdown         |      |
|  |                           | |                           |      |
|  | [Donut Chart]             | | [Stacked Bar Chart]      |      |
|  | Occupied: 179  (72%)      | | Monthly paid vs pending   |      |
|  | Vacant:    45  (18%)      | |                           |      |
|  | Booked:    14  ( 6%)      | |                           |      |
|  | Maint:     10  ( 4%)      | |                           |      |
|  +---------------------------+ +---------------------------+      |
|                                                                    |
|  +---------------------------+ +---------------------------+      |  Quick Tables
|  | Active Complaints         | | Upcoming Admissions       |      |
|  | ┌────────────────────┐    | | ┌────────────────────┐    |      |
|  | │ #  Issue    Status │    | | │ Name   Room  Date  │    |      |
|  | │ 1  Fan...   Open   │    | | │ Raj..  204A  15/02 │    |      |
|  | │ 2  Leak..  InProg  │    | | │ Kum..  107B  16/02 │    |      |
|  | │ 3  Lock..  Open    │    | | │ Ani..  302A  18/02 │    |      |
|  | │ 4  Wifi..  Hold    │    | | │ Pre..  201C  20/02 │    |      |
|  | │ 5  AC...   Open    │    | | │ Sur..  105A  22/02 │    |      |
|  | └────────────────────┘    | | └────────────────────┘    |      |
|  | View All Complaints →     | | View All Admissions →    |      |
|  +---------------------------+ +---------------------------+      |
+------------------------------------------------------------------+
```

### 6.3 KPI Cards

Use `StatsCard` component. Four cards in a `Grid2` row (3-column on each, wrapping to 2x2 on tablet, 1-column on mobile).

| Card | Label | Value source | Trend | Accent |
|------|-------|-------------|-------|--------|
| Total Beds | "Total Beds" | `cotsDetail.totalCots.length` | `${cotsDetail.available.length} available` | `info` |
| Occupancy Rate | "Occupancy" | `Math.round(occupied/total * 100)%` | `+N% vs last month` (if data available) | `success` |
| Revenue | "Revenue" | `₹ ${payments.totalPaid}` | `₹${payments.totalPending} pending` | `success` |
| Open Issues | "Open Issues" | `complaints.Open + complaints.InProgress` | `${complaints.Open} new` | `error` if > 0, `success` if 0 |

### 6.4 Charts

**Occupancy Donut** (recharts `PieChart`):
- Center text: total bed count
- Segments: Occupied (primary.600), Vacant (success.400), Booked (warning.400), Maintenance (gray.300)
- Legend below chart
- Data from `cotsDetail` (occupied, available, booked, maintenance arrays)

**Revenue Bar Chart** (recharts `BarChart`):
- Monthly stacked bars: Paid (success.400) vs Pending (error.300)
- X-axis: month labels
- Y-axis: ₹ amounts with compact notation (1K, 1L)
- Data from `paymentsDetail` (grouped by month)

### 6.5 Quick Tables

Compact `DataTable` (no pagination, 5 rows max) showing:
- **Active Complaints**: Status badge, issue description (truncated), branch, raised date
- **Upcoming Admissions**: Resident name, room assignment, admission date

Each has a "View All →" link at bottom navigating to the full page.

### 6.6 Detail Modals

Keep existing modal components (`dashboard-cots-detail.tsx`, etc.) but refactor to use `DialogModal` + `DataTable` + `StatusBadge` instead of raw MUI Tables.

### 6.7 Files to Modify

| File | Action |
|------|--------|
| `src/pages/home/index.tsx` | **MODIFY** — Full rewrite: remove inline DataCard, use StatsCard + recharts + compact DataTable + FilterBar |
| `src/pages/dashboardDetail/dashboard-cots-detail.tsx` | **MODIFY** — Use DialogModal + DataTable |
| `src/pages/dashboardDetail/dashboard-complaints-detail.tsx` | **MODIFY** — Same |
| `src/pages/dashboardDetail/dashboard-payments-detail.tsx` | **MODIFY** — Same |
| `src/pages/dashboardDetail/dashboard-bookings-detail.tsx` | **MODIFY** — Same |

---

## 7. Core Operations Pages

> Every operational page follows the **Standard Page Pattern**:

```tsx
// Standard pattern for every list page
<>
  <PageHeader title="..." description="...">
    <ExportButton onExport={handleExport} />
    <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>
      Add New
    </Button>
  </PageHeader>

  <FilterBar>
    <SelectField label="Branch" ... />
    <SelectField label="Status" ... />
    <DateRangeFilter ... />
    <SearchInput ... />
  </FilterBar>

  <DataTable
    columns={columns}
    data={filteredData}
    loading={loading}
    totalCount={totalCount}
    page={page}
    rowsPerPage={rowsPerPage}
    onPageChange={handlePageChange}
  />

  <DialogModal open={dialogOpen} title="..." onClose={handleClose}>
    {/* Form content */}
  </DialogModal>
</>
```

### 7.1 Admissions

**`src/pages/admissions/index.tsx`**:
- Page title: "Admissions" (description: "Manage resident registrations and approvals")
- Toggle between "Pending" and "Approved" views using MUI `ToggleButtonGroup` (replaces custom tab implementation)
- DataTable columns: #, Resident Name, Branch, Room/Bed, Admission Date, Status (StatusBadge), Actions
- "Add New Admission" button → "Register Resident"
- All "Candidate" column headers → "Resident"
- Search filters by name, mobile, email

**`src/pages/admissions/admissionConfirm.tsx`** (7-step wizard):
- Use MUI `Stepper` component with `primary.600` active color
- Step labels: "Resident Details", "Emergency Contact", "Documents", "Purpose of Stay", "Room & Pricing", "Payment Setup", "Additional Details"
- Each step rendered by sub-components in `components/`
- Navigation: "Back" (outlined) + "Save & Continue" (primary) at bottom
- All sub-components (`candidateDetails.tsx`, `contactPerson.tsx`, etc.): Replace Bootstrap `col-md-*` with MUI `Grid2`. Replace `textFieldStyle` with `FormField` wrapper. Replace `customRadio` with theme-styled Radio.

**Other admission pages**:
- `admissionTransfer.tsx`: "Admission Transfer" → "Room Transfer"
- `candidatePayments.tsx`: "Candidate Payments" → "Resident Payments"
- `candidatePaymentDetails.tsx`: Keep as modal/detail view. Use DataTable for payment breakdown
- `ebCharges.tsx`: "EB Charges" → "Utility Charges"

### 7.2 Complaints

**`src/pages/complaint/index.tsx`** (~1000+ lines, heaviest page):
- Page title: "Complaints" (description: "Track and resolve maintenance issues")
- FilterBar: Branch (multi-select), Status dropdown, DateRange, Search
- DataTable columns: #, Issue, Branch, Room/Bed, Reported By, Status (StatusBadge), Assigned To, Raised Date, Actions
- Status flow visualization in detail dialog: Open → InProgress → Closed (with Hold/Reject branches)
- Create/Edit form: Replace Bootstrap layout with `Grid2` + `FormField`
- Remove all `textFieldStyle`, `customTableTemplate`, `customTableHeader`, `CustomTableHover`, `customRadio` imports — theme handles everything
- Assign dialog: service provider category → provider selection

### 7.3 Branches

**`src/pages/branch/index.tsx`**:
- Page title: "Branches" (description: "Manage hostel locations and infrastructure")
- Branch list as DataTable (not cards)
- Click row or "View" button → expands detail panel or navigates to detail
- Tab panel: "Details", "Rooms & Beds" (was "Rooms & Cots"), "Photos", "Amenities"
- `branchDetails.tsx`: Form with `Grid2` + `FormField`
- `roomsAndCots.tsx`: Nested DataTable — rooms with expandable cot rows. "Cot" labels → "Bed"
- `branchPhotos.tsx`: Photo grid with `FileUpload` component
- `branchAmenities.tsx`: Checkbox grid of available amenities

### 7.4 Checkout

**`src/pages/vacate/index.tsx`**:
- Page title: "Checkout" (was "Vacate")
- All "Vacate" text in UI → "Checkout"
- DataTable columns: #, Resident, Branch, Room/Bed, Notice Date, Checkout Date, Status (StatusBadge), Net Payable, Actions
- Financial settlement section in dialog:
  - Use `Grid2` with clear grouping: "Charges" (admission fee, monthly rent, penalty, dues) vs "Credits" (advance paid, refund)
  - Net payable highlighted in `text.lg` bold
  - Currency values right-aligned with `tabular-nums`

### 7.5 Files to Modify (all MODIFY)

```
src/pages/admissions/index.tsx
src/pages/admissions/admissionConfirm.tsx
src/pages/admissions/admissionTransfer.tsx
src/pages/admissions/candidatePayments.tsx
src/pages/admissions/candidatePaymentDetails.tsx
src/pages/admissions/ebCharges.tsx
src/pages/admissions/components/candidateDetails.tsx
src/pages/admissions/components/contactPerson.tsx
src/pages/admissions/components/documents.tsx
src/pages/admissions/components/purposeOfStay.tsx
src/pages/admissions/components/roomAndFee.tsx
src/pages/admissions/components/payments.tsx
src/pages/admissions/components/others.tsx
src/pages/admissions/components/style.scss            ← DELETE (styles absorbed into theme)
src/pages/complaint/index.tsx
src/pages/branch/index.tsx
src/pages/branch/components/branchDetails.tsx
src/pages/branch/components/roomsAndCots.tsx
src/pages/branch/components/branchPhotos.tsx
src/pages/branch/components/branchAmenities.tsx
src/pages/vacate/index.tsx
```

**For every page above, the modification pattern is the same**:
1. Remove all imports of `customTableTemplate`, `customTableHeader`, `CustomTableHover`, `textFieldStyle`, `customRadio` from HelperService
2. Remove all Bootstrap class usage (`d-flex`, `col-md-*`, `justify-content-between`, `row`, `container`, `rounded`, `shadow`, `p-*`, `m-*`, `fw-bold`, `text-center`, `text-muted`, etc.)
3. Replace MUI `Table`/`TableHead`/`TableBody`/`TableRow`/`TableCell` blocks with `<DataTable>` component
4. Replace page title sections with `<PageHeader>`
5. Replace filter rows with `<FilterBar>` containing `<SearchInput>`, `<SelectField>`, `<DateRangeFilter>`
6. Replace status SCSS classes with `<StatusBadge>`
7. Replace raw `TextField sx={textFieldStyle}` with themed `TextField` inside `<FormField>`
8. Replace `SkeletonProviderTables` with DataTable's built-in `loading` prop
9. Replace "Data Not Found" table cells with DataTable's built-in empty state
10. Replace Bootstrap grid (`row` + `col-md-*`) with MUI `Grid2` using `container` + `size={{ xs: 12, md: 6 }}` pattern
11. Replace `className="fw-bold fs18"` etc. with MUI `Typography` using theme variants

---

## 8. People & Management Pages

All follow the Standard Page Pattern from Section 7.

### 8.1 User Directory (`src/pages/userList/index.tsx`)

- Page title: "User Directory" (description: "Manage admin and manager accounts")
- DataTable: Name, Email, Mobile, Role, Branch, Status, Actions
- Create/Edit dialog: `FormField` wrappers for first name, last name, email, mobile, role (select), branch (select)
- Mobile/email uniqueness validation (async, keep existing logic)

### 8.2 Role Permissions (`src/pages/userRolePageAccess/index.tsx`)

- Page title: "Role Permissions" (description: "Configure page access levels per role")
- Left: Role selector dropdown
- Right: Permission matrix table — page names as rows, access level (Full / Read Only / None) as radio group per row
- Use MUI `RadioGroup` with themed radio buttons (primary.600 when checked)
- Save button at bottom

### 8.3 Service Providers (`src/pages/serviceProvider/index.tsx`)

- Page title: "Service Providers" (description: "Manage internal and external workers")
- FilterBar: Category (select), Type (Internal/External toggle), Search
- DataTable: Name, Mobile, Company, Type (badge), Categories, Rating (stars or numeric), Actions
- Create/Edit dialog with full worker form

### 8.4 Restricted Residents (`src/pages/blackList/index.tsx`)

- Page title: "Restricted Residents" (was "Black List")
- Warning accent: page header could have a subtle `warning.50` background bar to indicate restricted area
- DataTable: Resident Name, Mobile, Date Restricted, Reason, Restricted By, Actions
- Restrict dialog: search candidate, enter reason, date, "Inform Parents" / "Inform Guardian" checkboxes

### 8.5 Feedback (`src/pages/feedBack/index.tsx`)

- Page title: "Feedback" (description: "Review resident satisfaction ratings")
- DataTable: Resident, Branch, Stay Rating, Food Rating, Cleanliness, Security, Staff, Date
- Rating columns: use numeric display (e.g. "4.2") or MUI `Rating` component (read-only stars)
- Detail dialog: full ratings breakdown + manager comments section

### 8.6 Attendance (`src/pages/attendance/index.tsx`)

- Page title: "Attendance" (description: "Track daily resident attendance")
- Standard DataTable with date-based records

### 8.7 Announcements (`src/pages/announcements/index.tsx`)

- Page title: "Announcements" (description: "Create and manage hostel-wide announcements")
- Card-based list (not DataTable — announcements are content, not data rows)
- Create/Edit dialog with title + body (multiline TextField)

### 8.8 Files to Modify

```
src/pages/userList/index.tsx
src/pages/userRolePageAccess/index.tsx
src/pages/serviceProvider/index.tsx
src/pages/blackList/index.tsx
src/pages/feedBack/index.tsx
src/pages/attendance/index.tsx
src/pages/announcements/index.tsx
```

Same modification pattern as Section 7: remove Bootstrap classes, remove HelperService style objects, use shared components.

---

## 9. Configuration / Master Data Pages

> **Strategy**: Build `MasterCrudPage.tsx` once, then each of the 13 master pages becomes a thin config file.

### 9.1 Master page migration

Each master page currently has 200-400 lines of duplicated logic: state management, grid fetching, pagination, create/edit dialog, form validation, submit handler, delete handler, toggle active/inactive.

**After migration**, each file looks like:

```tsx
// src/pages/master/roomtype.tsx — ~40 lines
import { MasterCrudPage } from '../../components/shared';
import { getMasterRoomType, insertUpdateMasterRoomType, deleteMasterRoomType } from '../../models';

export default function RoomTypePage({ PageAccess }: any) {
  return (
    <MasterCrudPage
      title="Room Types"
      description="Manage room classification types (AC, Non-AC, etc.)"
      pageAccess={PageAccess}
      columns={[
        { id: 'sno', label: '#', width: 60, render: (_, i) => i + 1 },
        { id: 'name', label: 'Type Name', render: (row) => row.name },
        { id: 'isActive', label: 'Status', render: (row) => (
          <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
        )},
      ]}
      formFields={[
        { name: 'name', label: 'Type Name', required: true, type: 'text' },
      ]}
      apiGet={getMasterRoomType}
      apiSave={insertUpdateMasterRoomType}
      apiDelete={deleteMasterRoomType}
    />
  );
}
```

### 9.2 Page-specific label mapping

| File | Current title | New title | New description |
|------|--------------|-----------|-----------------|
| `roomtype.tsx` | Room Type | Room Types | Manage room classification types |
| `bathroomType.tsx` | Bathroom Type | Bathroom Types | Manage bathroom configurations |
| `cotType.tsx` | Cot Type | Bed Types | Manage bed/cot type classifications |
| `SharingType.tsx` | Sharing Type | Sharing Types | Define room sharing configurations |
| `amenitiesCategory.tsx` | Amenities Categories | Amenity Categories | Manage amenity group classifications |
| `amenitiesSubCategory.tsx` | Amenities Sub-Categories | Amenity Sub-Categories | Manage amenity sub-groups |
| `amenitiesFacilities.tsx` | Amenities Facilities | Amenity Facilities | Manage individual amenity items |
| `IssueCategories.tsx` | Issue Categories | Issue Categories | Define maintenance issue types |
| `IssuesSubCategories.tsx` | Issue Sub-Categories | Issue Sub-Categories | Define specific issue types within categories |
| `PageList.tsx` | Page List | Page Registry | Manage system pages for access control |
| `MasterUserRole.tsx` | User Role | User Roles | Define system roles |
| `serviceProviderCategory.tsx` | Service Provider Category | Provider Categories | Manage worker specialty categories |
| `bulkUpload.tsx` | Bulk Upload | Bulk Import | Import data from Excel spreadsheets |

### 9.3 Bulk Upload page

`bulkUpload.tsx` is different from other master pages — it uses `FileUpload` + `BulkUploadData` components. Don't use `MasterCrudPage` for this one. Instead:
- Page title: "Bulk Import"
- `FileUpload` component for drag-and-drop
- Tab or dropdown to select import type (Candidates, Rooms, Beds, Vacate, Users)
- Preview table showing parsed rows before import
- Import progress indicator

### 9.4 Files to Modify

```
src/pages/master/roomtype.tsx
src/pages/master/bathroomType.tsx
src/pages/master/cotType.tsx
src/pages/master/SharingType.tsx
src/pages/master/amenitiesCategory.tsx
src/pages/master/amenitiesSubCategory.tsx
src/pages/master/amenitiesFacilities.tsx
src/pages/master/IssueCategories.tsx
src/pages/master/IssuesSubCategories.tsx
src/pages/master/PageList.tsx
src/pages/master/MasterUserRole.tsx
src/pages/master/serviceProviderCategory.tsx
src/pages/master/bulkUpload.tsx
src/pages/master/userRolePageAccess/index.tsx        ← DELETE (deprecated, replaced by src/pages/userRolePageAccess/)
```

---

## 10. Phase Execution Order

```
PHASE 0: Design System Foundation                          ⏱ Estimated: 1 day
├── Create src/theme/ (tokens, palette, typography, components, index)
├── Modify AppThemeProvider.tsx
├── Rewrite app.scss (remove Bootstrap, add Inter, minimal reset)
├── Rewrite variables.scss
├── Create layout.scss, utilities.scss
├── Remove bootstrap from package.json, add recharts
└── Verify: `npm run dev` starts, pages render (visually inconsistent but functional)

PHASE 1: Layout Architecture                               ⏱ Estimated: 1 day
├── Create navigation.ts config
├── Create all src/components/layout/ files (8 files)
├── Modify dashboardLayout.tsx to use AppShell
├── Modify authLayout.tsx for new gradient design
├── Modify StateReducer.ts (TOGGLE_SIDEBAR)
├── Delete dashboardNewHeader.tsx
└── Verify: Sidebar renders, all nav links work, mobile drawer works, breadcrumbs correct

PHASE 2: Shared Component Library                          ⏱ Estimated: 1 day
├── Create all src/components/shared/ files (16 files + index)
├── Modify HelperService.ts (remove style objects)
├── Update SkeletonProvider.tsx
├── Delete CustomAbsoluteBox.tsx
└── Verify: Components render correctly in isolation

PHASE 3: Login Page                                        ⏱ Estimated: 2 hours
├── Modify authLayout.tsx (gradient background)
├── Modify login.tsx (MUI layout, FormField, themed OTP inputs)
└── Verify: OTP login flow works end-to-end

PHASE 4: Dashboard                                         ⏱ Estimated: 4 hours
├── Rewrite home/index.tsx (StatsCard, charts, compact tables)
├── Update 4 dashboard detail modal components
└── Verify: KPIs load, charts render, filters work, drill-down modals work

PHASE 5: Core Operations (most-used pages)                 ⏱ Estimated: 2 days
├── Admissions (index + confirmation + transfer + payments + ebCharges + 7 sub-components)
├── Complaints
├── Branches (index + 4 sub-components)
├── Checkout
└── Verify: All CRUD operations, filters, pagination, dialogs work

PHASE 6: People & Management Pages                         ⏱ Estimated: 1 day
├── User Directory, Role Permissions, Service Providers
├── Restricted Residents, Feedback, Attendance, Announcements
└── Verify: All CRUD, role matrix, feedback ratings work

PHASE 7: Configuration / Master Data                       ⏱ Estimated: 4 hours
├── Build MasterCrudPage.tsx
├── Migrate 12 master pages to thin configs
├── Update bulkUpload.tsx
├── Delete deprecated master/userRolePageAccess/
└── Verify: All master CRUD operations work
```

### Dependency Graph

```
Phase 0 ──→ Phase 1 ──→ Phase 2 ──┬──→ Phase 3 (Login)
                                   ├──→ Phase 4 (Dashboard)
                                   ├──→ Phase 5 (Core Ops)     ← Do FIRST after Phase 2
                                   ├──→ Phase 6 (People)
                                   └──→ Phase 7 (Master)       ← Do LAST (fastest)
```

Phases 3–7 are independent of each other. Phase 5 should come first (most-used pages).

---

## 11. File Inventory

### New files to create (~33)

| Directory | Files | Count |
|-----------|-------|-------|
| `src/theme/` | tokens.ts, palette.ts, typography.ts, components.ts, index.ts | 5 |
| `src/configs/` | navigation.ts | 1 |
| `src/components/layout/` | Sidebar.tsx, SidebarItem.tsx, SidebarGroup.tsx, TopHeader.tsx, Breadcrumbs.tsx, ContentArea.tsx, AppShell.tsx, UserMenu.tsx | 8 |
| `src/components/shared/` | DataTable.tsx, PageHeader.tsx, FilterBar.tsx, StatusBadge.tsx, StatsCard.tsx, SearchInput.tsx, FormField.tsx, DialogModal.tsx (modify existing CustomDialogue), ConfirmDialog.tsx, EmptyState.tsx, ExportButton.tsx, MasterCrudPage.tsx, FileUpload.tsx (modify existing DragDropUpload), LoadingOverlay.tsx, index.ts | 15 |
| `src/assets/scss/` | layout.scss, utilities.scss | 2 |

### Files to modify (~50)

| Category | Files |
|----------|-------|
| Theme/SCSS | AppThemeProvider.tsx, variables.scss, app.scss | 3 |
| Layout | dashboardLayout.tsx, authLayout.tsx | 2 |
| State | StateReducer.ts | 1 |
| Services | HelperService.ts, SkeletonProvider.tsx | 2 |
| Dashboard | home/index.tsx, 4 dashboard detail modals | 5 |
| Admissions | index, admissionConfirm, admissionTransfer, candidatePayments, candidatePaymentDetails, ebCharges, 7 sub-components | 13 |
| Complaints | complaint/index.tsx | 1 |
| Branch | branch/index.tsx, 4 sub-components | 5 |
| Checkout | vacate/index.tsx | 1 |
| People | userList, userRolePageAccess, serviceProvider, blackList, feedBack, attendance, announcements | 7 |
| Master | 13 master page files | 13 |
| Config | package.json, index.html | 2 |

### Files to delete (~4)

| File | Reason |
|------|--------|
| `src/components/layouts/dashboardNewHeader.tsx` | Replaced by Sidebar + TopHeader |
| `src/components/helpers/CustomAbsoluteBox.tsx` | Replaced by MUI Popover/Menu |
| `src/pages/master/userRolePageAccess/index.tsx` | Deprecated duplicate of `src/pages/userRolePageAccess/` |
| `src/pages/admissions/components/style.scss` | Styles absorbed into theme |

### Dependency changes

| Action | Package |
|--------|---------|
| **ADD** | `recharts@^2.12.0` |
| **ADD** (optional) | `lucide-react@^0.400.0` |
| **REMOVE** | `bootstrap` |

---

## 12. Verification Checklist

### After Phase 0 (Design System)
- [ ] `npm run dev` starts without errors
- [ ] Inter font loads (check Network tab or inspect body font-family)
- [ ] No `#F76D61` salmon color visible anywhere
- [ ] No `Nunito` font reference in CSS
- [ ] MUI components (Button, TextField, Table) render with new theme when used on any existing page

### After Phase 1 (Layout)
- [ ] Dark sidebar renders on left for all dashboard routes
- [ ] Sidebar sections match the config (Overview, Operations, People, Configuration)
- [ ] Every nav link navigates to the correct route
- [ ] Active nav item has left border accent + highlight background
- [ ] Expandable groups (Admissions, Users & Access, Master Data) open/close with animation
- [ ] Sidebar collapses to 72px icon rail on toggle click
- [ ] Collapsed rail shows tooltips on icon hover
- [ ] Mobile: hamburger opens drawer overlay with same nav items
- [ ] TopHeader shows user avatar + name, logout dropdown works
- [ ] Breadcrumbs show correct path for every page
- [ ] Content area scrolls independently from sidebar/header
- [ ] RBAC: pages with `accessLevel === 'No'` show NoAccess component

### After Phase 2 (Shared Components)
- [ ] `<DataTable>` renders loading skeletons, data rows, empty state, pagination
- [ ] `<StatusBadge>` maps all status strings to correct colors
- [ ] `<PageHeader>` renders title, description, action buttons
- [ ] `<FilterBar>` wraps filter elements in horizontal row
- [ ] `<StatsCard>` shows label, value, trend
- [ ] `<SearchInput>` debounces and clears
- [ ] `<FormField>` shows label, required asterisk, error message
- [ ] `<ConfirmDialog>` opens with danger/default variants
- [ ] `<EmptyState>` renders centered icon + message
- [ ] `<ExportButton>` triggers Excel download via `getExportEXCEL`

### After Phase 3 (Login)
- [ ] Login page has dark gradient background, centered white card
- [ ] Email field themed correctly
- [ ] OTP input boxes styled (48px, rounded, primary focus ring)
- [ ] OTP send → verify flow works
- [ ] Redirect to dashboard on successful login

### After Phase 4 (Dashboard)
- [ ] 4 KPI StatsCards show correct data
- [ ] Donut chart renders bed occupancy breakdown
- [ ] Bar chart renders revenue data
- [ ] Quick tables show recent complaints and admissions
- [ ] Branch filter and date range filter work
- [ ] Clicking StatsCard opens detail modal
- [ ] Detail modals use DataTable with proper styling

### After Phase 5-7 (All Pages)
- [ ] Every page uses `<PageHeader>` for title
- [ ] Every page uses `<DataTable>` for list views
- [ ] Every page uses `<FilterBar>` for filters
- [ ] Every page uses `<StatusBadge>` for status columns
- [ ] Every page uses `<FormField>` for form inputs
- [ ] All CRUD operations work (create, read, update, delete/toggle)
- [ ] All pagination works (page change, rows per page change)
- [ ] All filters work (branch, status, date range, search)
- [ ] All dialogs open and close correctly
- [ ] Excel export works on pages that had it before
- [ ] File upload works (documents, photos)

### Cross-cutting final checks
- [ ] Zero Bootstrap classes in any JSX (`d-flex`, `col-md-*`, `row`, `container`, `rounded`, `shadow`, `p-*`, `m-*`, `fw-bold`, `text-center`, `text-muted`, `justify-content-*`, `align-items-*`)
- [ ] Zero `#F76D61` or `$primary: #F76D61` references
- [ ] Zero `Nunito` font references
- [ ] Zero `customTableTemplate`, `customTableHeader`, `textFieldStyle`, `customRadio` imports
- [ ] No UI text says "Candidate" (should be "Resident")
- [ ] No UI text says "Cot" (should be "Bed")
- [ ] No UI text says "Vacate" (should be "Checkout")
- [ ] No UI text says "Black List" (should be "Restricted Residents")
- [ ] No UI text says "EB Charges" (should be "Utility Charges")
- [ ] All pages accessible via sidebar navigation
- [ ] Responsive: desktop (sidebar expanded), tablet (sidebar collapsed), mobile (drawer)
- [ ] Tab key navigation works through forms
- [ ] All status badges are accessible (color + text label, not color alone)
- [ ] Currency values use `tabular-nums` for alignment
- [ ] Page titles match sidebar labels

---

## Appendix A: Design Decision Rationale

### Why this specific gray scale?
The gray tokens (`gray.25` through `gray.900`) come from the Untitled UI / Shadcn gray scale, which has been battle-tested across thousands of production SaaS applications. Pure Tailwind slate (blue-tinted) can make an interface feel cold and clinical. This scale has a neutral warm undertone that reads as "professional and trustworthy" — the same quality you see in Stripe's dashboard.

### Why `#155EEF` as primary?
It sits at the intersection of IBM Carbon Blue-60 (`#0F62FE`), Stripe's interactive blue (`#0570DE`), and Ant Design's Daybreak Blue (`#1677FF`). This blue:
- Passes WCAG AA on white backgrounds (4.7:1 contrast)
- Is saturated enough to clearly signal "this is interactive"
- Is not so vivid that it overwhelms when used for active sidebar states
- Works in both light and dark contexts

### Why remove Bootstrap?
Bootstrap adds ~200KB to the bundle and creates a competing layout system. MUI's `Grid2`, `Stack`, and `Box` provide the same functionality with type safety and theme integration. Every Bootstrap utility class (`d-flex`, `col-md-6`, `p-3`) has a direct MUI equivalent. Removing Bootstrap eliminates the constant question of "should I use Bootstrap or MUI for this?" — the answer is always MUI.

### Why Inter over system fonts?
System fonts (San Francisco, Segoe UI) vary across platforms. Inter provides:
- Consistent rendering on Windows, macOS, and Linux
- Tabular number forms (critical for aligned data columns)
- Variable font support (single file, all weights)
- The same font used by GitHub, Figma, Linear, and Vercel
- Geometric precision that works at 11-14px sizes common in enterprise UIs

### Why not dark mode?
Dark mode adds significant implementation complexity (separate token set, user preference storage, flash-of-unstyled-content prevention). The token architecture in this plan supports adding dark mode later — all colors are referenced by token name, not hardcoded hex. But for V1, light mode only.

### Why `recharts` over Chart.js?
- React-native (not a wrapper around a DOM library)
- Declarative API (JSX components, not imperative config objects)
- SSR compatible
- Smaller bundle (tree-shakeable)
- Used by Vercel, Supabase, and other React-first companies

---

## Appendix B: Quick Reference — Bootstrap → MUI Mapping

| Bootstrap | MUI Equivalent |
|-----------|---------------|
| `<div className="d-flex">` | `<Box sx={{ display: 'flex' }}>` or `<Stack direction="row">` |
| `<div className="row">` | `<Grid2 container spacing={2}>` |
| `<div className="col-md-6">` | `<Grid2 size={{ xs: 12, md: 6 }}>` |
| `<div className="col-md-3">` | `<Grid2 size={{ xs: 12, sm: 6, md: 3 }}>` |
| `justify-content-between` | `justifyContent: 'space-between'` |
| `align-items-center` | `alignItems: 'center'` |
| `p-3` | `p={3}` (MUI uses 8px units, so `p={3}` = 24px) |
| `m-2` | `m={2}` (16px) |
| `my-2` | `my={2}` |
| `px-3` | `px={3}` |
| `gap-3` | `gap={3}` or `spacing={3}` |
| `fw-bold` | `fontWeight: 700` or `<Typography fontWeight={700}>` |
| `fs14` / `fs18` | `<Typography variant="body2">` / `<Typography variant="h6">` |
| `text-muted` | `color="text.secondary"` |
| `text-center` | `textAlign: 'center'` |
| `rounded` | `borderRadius: 1` (8px) |
| `shadow` | `boxShadow: 1` |
| `container` | `<Container maxWidth="xl">` or just padding on content area |
| `d-none d-lg-block` | `display: { xs: 'none', lg: 'block' }` |
| `d-block d-lg-none` | `display: { xs: 'block', lg: 'none' }` |
| `flex-wrap` | `flexWrap: 'wrap'` |
| `bg-white` | `bgcolor: 'background.paper'` |
