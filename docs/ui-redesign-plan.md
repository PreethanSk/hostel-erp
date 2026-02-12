# Hostel ERP - Complete UI/UX Redesign Plan

> **Scope**: Full visual redesign of the Admin portal, establishing a design language for Student and Worker portals.
> **Approach**: Replace the current salmon-colored, Bootstrap-heavy, top-bar navigation with a modern sidebar-first layout, slate/blue palette, Inter typography, and a unified MUI component system.
> **Backend**: No changes. Same routes, same APIs, same data models.

---

## Current State Analysis

### What exists today
- **Navigation**: Horizontal top bar with salmon (#F76D61) background, 10+ items crammed in, popup dropdowns for grouped items (Admission, Master, User)
- **Layout**: No sidebar. White background, Bootstrap grid (`d-flex`, `col-md-6`, etc.) mixed with MUI components
- **Theme**: Salmon/coral primary, Nunito font (rounded/playful), pure white body
- **Styles**: One 870-line `app.scss` with Bootstrap import, ad-hoc utility classes, inline styles
- **Tables**: Raw MUI Table with `customTableTemplate`/`customTableHeader` style objects from HelperService
- **Forms**: Plain TextFields with Bootstrap layout
- **Status indicators**: Raw SCSS classes (`.statusInProgress`, `.statusResolved`, etc.)
- **No breadcrumbs**, no charts, no sidebar, no design tokens

### Why a redesign is needed
1. Salmon/coral color is casual/feminine, not professional ERP
2. Nunito font is too rounded for data-heavy admin panels
3. Top-bar nav is cramped and doesn't scale to 30+ pages
4. Bootstrap + MUI creates two competing design systems
5. Dashboard is just 4 plain cards with numbers
6. No unified component library -- each page reinvents the wheel
7. Regional/informal terminology ("Cot", "EB Charges", "Vacate", "Candidate")

---

## Phase 0: Design System Foundation

**Goal**: Establish the new design language as centralized tokens before touching any pages.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#2563EB` | Buttons, active states, links, sidebar accent |
| Primary Light | `#3B82F6` | Hover states |
| Primary Dark | `#1D4ED8` | Active/pressed states |
| Primary Surface | `#EFF6FF` | Light background tint, active nav item bg |
| Secondary | `#0F172A` | Sidebar background, headings |
| Secondary Light | `#1E293B` | Sidebar hover |
| Neutral 50 | `#F8FAFC` | Page background (replaces pure white) |
| Neutral 100 | `#F1F5F9` | Card backgrounds, input fields |
| Neutral 200 | `#E2E8F0` | Borders, dividers |
| Neutral 300 | `#CBD5E1` | Disabled states |
| Neutral 500 | `#64748B` | Secondary text |
| Neutral 700 | `#334155` | Primary text |
| Neutral 900 | `#0F172A` | Headings |
| Success | `#16A34A` | Approved, Active, Closed statuses |
| Success Surface | `#F0FDF4` | Success badge background |
| Warning | `#D97706` | Pending, Hold statuses |
| Warning Surface | `#FFFBEB` | Warning badge background |
| Error | `#DC2626` | Open issues, Rejected, overdue |
| Error Surface | `#FEF2F2` | Error badge background |
| Info | `#0284C7` | In Progress, informational |
| Info Surface | `#F0F9FF` | Info badge background |

**Rationale**: Blue/slate conveys trust and stability -- the standard for financial/management systems. 4.5:1+ contrast ratios for accessibility.

### Typography

| Level | Size | Weight | Color | Usage |
|-------|------|--------|-------|-------|
| H1 | 24px | 700 | Neutral 900 | Page titles |
| H2 | 20px | 600 | Neutral 900 | Section titles |
| H3 | 16px | 600 | Neutral 700 | Card titles |
| Body 1 | 14px | 400 | Neutral 700 | Primary content |
| Body 2 | 13px | 400 | Neutral 500 | Secondary content |
| Caption | 12px | 500 | Neutral 500 | Labels, timestamps |
| Overline | 11px | 600 | Neutral 400 | Uppercase small labels |

**Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
**Rationale**: Inter is geometric, highly legible at small sizes, excellent tabular number rendering. Standard for data-heavy SaaS UIs.

### Spacing & Layout Tokens

```
Spacing Scale:    4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (px)
Border Radius:    sm: 6px, md: 8px, lg: 12px, xl: 16px
Shadow sm:        0 1px 2px rgba(0,0,0,0.05)
Shadow md:        0 4px 6px -1px rgba(0,0,0,0.07)
Shadow lg:        0 10px 15px -3px rgba(0,0,0,0.08)
Sidebar Width:    expanded: 260px, collapsed: 72px
Header Height:    64px
Content Padding:  24px
```

### MUI Component Overrides

Every MUI component gets themed:

| Component | Override |
|-----------|---------|
| MuiButton | 8px radius, font-weight 600, padding 8px 20px, no uppercase |
| MuiTextField | Neutral-100 bg, Neutral-200 border, 6px radius, 14px font |
| MuiTableContainer | White bg, md shadow, lg radius |
| MuiTableHead | Neutral-50 bg, caption typography, uppercase labels |
| MuiTableCell | Body2 typography, 12px 16px padding |
| MuiTableRow | Primary-surface hover, smooth transition |
| MuiCard | White bg, md shadow, lg radius, 0 border |
| MuiChip | Status variants with semantic surface/text colors |
| MuiDialog | lg radius, proper title spacing |
| MuiTab | No text-transform, 600 weight |
| MuiSelect | Same as TextField treatment |
| MuiDrawer | Slate-900 bg for sidebar |

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/theme/tokens.ts` | CREATE | Central design tokens |
| `src/theme/palette.ts` | CREATE | MUI palette from tokens |
| `src/theme/typography.ts` | CREATE | MUI typography with Inter |
| `src/theme/components.ts` | CREATE | All MUI component overrides |
| `src/theme/index.ts` | CREATE | Exports `createTheme()` combining all above |
| `src/providers/AppThemeProvider.tsx` | MODIFY | Import new theme from `src/theme` |
| `src/assets/scss/variables.scss` | MODIFY | Replace salmon colors with new palette |
| `src/assets/scss/app.scss` | MODIFY | Remove Bootstrap import, gut all old styles, replace with minimal reset + token-based utilities |
| `src/assets/scss/layout.scss` | CREATE | Sidebar + header + content area layout styles |
| `src/assets/scss/utilities.scss` | CREATE | Minimal utility classes that complement MUI |
| `package.json` | MODIFY | Remove `bootstrap` dependency |

**Key Decision**: Remove Bootstrap entirely. MUI's `Grid2`, `Stack`, and `Box` replace everything Bootstrap provides, with type safety and theme integration. This eliminates the two-competing-design-systems problem.

---

## Phase 1: Layout Architecture Overhaul

**Goal**: Replace the horizontal top navbar with a collapsible left sidebar + slim top header.

### New Layout Structure

```
+----------------------------------------------------------+
| [=] Hostel ERP        Search...     [Bell] [Avatar ▾]    |  <- TopHeader (64px)
+--------+-------------------------------------------------+
|        |                                                  |
| [icon] |   Dashboard  >  Overview              (breadcrumb)
| Dash   |                                                  |
|        |   +--------+ +--------+ +--------+ +--------+   |
| [icon] |   | Card 1 | | Card 2 | | Card 3 | | Card 4 |  |
| Admis  |   +--------+ +--------+ +--------+ +--------+   |
|  > List|                                                  |
|  > Conf|   +------------------------------------------+  |
|        |   |  Table / Content Area                     |  |
| [icon] |   |                                           |  |
| Compl  |   +------------------------------------------+  |
|        |                                                  |
| [icon] |                                                  |
| Branch |                                                  |
|        |                                                  |
| [icon] |                                                  |
| Check  |                                                  |
| out    |                                                  |
+--------+-------------------------------------------------+
  260px           rest of viewport (fluid)
```

### Sidebar Navigation Structure

```
MAIN
  Dashboard

OPERATIONS
  Admissions >
    Admission List
    Confirmation
    Transfer
    Resident Payments
    Utility Charges
  Complaints
  Checkout
  Branches

PEOPLE
  Users & Access >
    User Directory
    Role Permissions
    Service Providers
  Restricted Residents
  Feedback
  Attendance
  Announcements

CONFIGURATION
  Master Data >
    Room Types
    Bed Types
    Sharing Types
    Bathroom Types
    Amenity Categories
    Amenity Sub-Categories
    Amenity Facilities
    Issue Categories
    Issue Sub-Categories
    Page Registry
    User Roles
    Provider Categories
    Bulk Import
```

### Sidebar Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1200px) | Full sidebar 260px with icon + text. Collapse button shrinks to 72px icons-only with tooltips |
| Tablet (768-1200px) | Collapsed by default (72px). Expand on hover or toggle |
| Mobile (<768px) | Hidden. Hamburger in TopHeader opens MUI Drawer overlay |

**Active state**: Left 3px Primary Blue border, Primary-Surface background, 600 font-weight text.

### Terminology Cleanup Map

| Current Term | New Term | Rationale |
|-------------|----------|-----------|
| Candidate | Resident | "Candidate" = applicant; "Resident" = standard hostel occupant |
| Cot | Bed | "Cot" is regional; "Bed" is universal |
| Vacate | Checkout | "Vacate" sounds punitive; "Checkout" is hospitality-standard |
| Black List | Restricted Residents | Less aggressive, more professional |
| EB Charges | Utility Charges | "EB" = regional electricity board abbreviation |
| Master | Configuration / Master Data | "Master" alone is ambiguous |
| Add New Admission | Register Resident | Clearer action verb |
| Candidate Payments | Resident Payments | Consistent with "Resident" rename |
| Page List | Page Registry | More precise |
| Data Not Found | No records found | More professional |
| Cot Type | Bed Type | Consistent with Bed rename |

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/configs/navigation.ts` | CREATE | Sidebar navigation config array |
| `src/components/layout/Sidebar.tsx` | CREATE | Collapsible sidebar with sections, groups, items |
| `src/components/layout/SidebarItem.tsx` | CREATE | Individual nav item with icon, label, active indicator |
| `src/components/layout/SidebarGroup.tsx` | CREATE | Expandable group with chevron toggle and children |
| `src/components/layout/TopHeader.tsx` | CREATE | 64px header: hamburger, search, notifications, user avatar |
| `src/components/layout/Breadcrumbs.tsx` | CREATE | Auto-generated from route path |
| `src/components/layout/ContentArea.tsx` | CREATE | Wrapper with padding, scroll behavior |
| `src/components/layout/DashboardShell.tsx` | CREATE | Combines Sidebar + TopHeader + Breadcrumbs + ContentArea + Outlet |
| `src/components/layout/UserMenu.tsx` | CREATE | Avatar dropdown with profile info + logout |
| `src/components/layouts/dashboardLayout.tsx` | MODIFY | Replace content with new DashboardShell import |
| `src/components/layouts/dashboardNewHeader.tsx` | DELETE | All 360 lines replaced by new layout components |
| `src/components/layouts/authLayout.tsx` | MODIFY | New gradient/pattern background, centered card |
| `src/providers/StateProvider.tsx` | MODIFY | Add `sidebarCollapsed: false` to state |
| `src/services/StateReducer.ts` | MODIFY | Add `TOGGLE_SIDEBAR` action |

---

## Phase 2: Shared Component Library

**Goal**: Build redesigned reusable components that every page will consume. These replace current helper components and ad-hoc patterns.

### Components to Create

| Component | Replaces | Purpose |
|-----------|----------|---------|
| `shared/DataTable.tsx` | Raw MUI Table + `customTableTemplate` + `customTableHeader` + `SkeletonProviderTables` | Unified data table: sortable columns, loading skeleton, empty state, pagination, row hover, responsive scroll. Props: `columns[]`, `data[]`, `loading`, `emptyMessage`, `onRowClick`, `pagination` |
| `shared/PageHeader.tsx` | Repeated `<div className="row justify-content-between...">` in every page | Standard page header: title, description, action buttons slot |
| `shared/FilterBar.tsx` | Repeated branch/date/status filter rows | Horizontal filter bar with slot-based filter items |
| `shared/StatusBadge.tsx` | `.statusBgActive`, `.statusInProgress`, etc. SCSS classes | MUI Chip that maps status strings to semantic colors |
| `shared/SearchInput.tsx` | `CustomSearch.tsx` (popup-based) | Always-visible search with debounce and clear button |
| `shared/SelectField.tsx` | `CustomSelect.tsx` | Themed MUI Select with consistent styling |
| `shared/DateRangeFilter.tsx` | `DateRangeSelector.tsx` | Date range with preset chips (Today, This Week, This Month, Custom) |
| `shared/FormField.tsx` | Repeated `<div className="text-muted fs14">Label</div><TextField>` | Labeled form field wrapper with consistent spacing |
| `shared/DialogModal.tsx` | `CustomDialogue.tsx` | Themed dialog with title bar, content, action footer |
| `shared/ConfirmDialog.tsx` | Sweetalert2 confirms | Native MUI confirm dialog with destructive/safe variants |
| `shared/StatsCard.tsx` | Dashboard ad-hoc MUI Cards | Metric card: icon, label, value, trend, color accent, click handler |
| `shared/EmptyState.tsx` | "Data Not Found" table cells | Illustrated empty state with icon, title, description, action button |
| `shared/FileUpload.tsx` | `DragDropUpload.tsx` | Drag-and-drop with preview, progress, file list |
| `shared/ExportButton.tsx` | Inline download icon buttons | Export dropdown (Excel/PDF), uses existing `getExportEXCEL` |
| `shared/LoadingOverlay.tsx` | Various loading states | Full-area or inline loading indicator |
| `shared/MasterCrudPage.tsx` | 12 nearly-identical master pages | Generic CRUD page: title, columns, formFields, apiGet, apiSave, apiDelete |
| `shared/index.ts` | N/A | Barrel export |

### DataTable Usage Example

**Before** (current pattern in every page):
```tsx
<TableContainer className="tableBorder rounded">
  <Table sx={{ ...customTableTemplate }}>
    <TableHead>
      <TableRow sx={{ ...customTableHeader }}>
        <TableCell className="fw-bold">S.No</TableCell>
        ...
      </TableRow>
    </TableHead>
    <TableBody>
      {items?.length > 0 ? items.map(...) : !loading ? (
        <TableRow><TableCell colSpan={7}>Data Not Found</TableCell></TableRow>
      ) : null}
      <SkeletonProviderTables columns={7} visible={loading} />
    </TableBody>
  </Table>
</TableContainer>
```

**After**:
```tsx
<DataTable
  columns={[
    { id: 'sno', label: '#', width: 60, render: (_, i) => i + 1 },
    { id: 'name', label: 'Resident', render: (row) => <>{row.candidateName}</> },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { id: 'actions', label: '', align: 'right', render: (row) => <IconButton>...</IconButton> },
  ]}
  data={filteredItems}
  loading={tableLoading}
  emptyMessage="No records found"
/>
```

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/services/HelperService.ts` | MODIFY | Remove `customTableTemplate`, `customTableHeader`, `textFieldStyle`, `textFieldStyleLogin`, `customRadio` (all replaced by theme). Keep utilities: `getExportEXCEL`, `CustomAlert`, `base64`, `formatDateToDisplay` |
| `src/providers/SkeletonProvider.tsx` | MODIFY | Update to use theme tokens. Table skeleton absorbed into DataTable |
| `src/components/helpers/CustomAbsoluteBox.tsx` | DELETE | Popup dropdowns replaced by proper MUI Popover/Menu |

---

## Phase 3: Login & Authentication

**Goal**: Redesign the login page with the new design language.

### New Login Design

- **Background**: Gradient from Slate-900 to Primary-Dark, or subtle geometric pattern
- **Card**: White, centered, max-width 440px, xl radius, lg shadow
- **Logo**: Top-center, updated to non-salmon branding
- **Title**: "Admin Portal" in H2
- **Email field**: Full-width themed TextField, label "Email Address"
- **OTP**: 6 digit boxes (keep react-otp-input, theme the inputs to match)
- **Buttons**: Full-width Primary "Request OTP" / "Verify OTP"
- **Resend**: Styled text link below button

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/auth/login.tsx` | MODIFY - Replace Bootstrap classes with MUI Stack/Box. Theme OTP inputs. Use FormField wrapper |
| `src/components/layouts/authLayout.tsx` | MODIFY - CSS gradient background, MUI Box layout |

---

## Phase 4: Dashboard Redesign

**Goal**: Transform 4 plain cards into a proper ERP overview with visualizations.

### New Dashboard Layout

```
+------------------------------------------------------------------+
| Dashboard                               [Branch v] [Date Range]  |
| Overview of hostel operations                                     |
+------------------------------------------------------------------+
| +----------+ +----------+ +----------+ +----------+               |
| | Beds     | | Complaints| | Revenue | | Admissions|              |
| | 248 total| | 14 Open  | | Rs 4.2L | | 32 Active|              |
| | +12% occ | | +3 today | | +8% MoM | | 5 pending|              |
| +----------+ +----------+ +----------+ +----------+               |
|                                                                    |
| +---------------------------+ +----------------------------+      |
| | Occupancy Overview        | | Payment Collection         |      |
| | [Donut chart:             | | [Bar chart: monthly        |      |
| |  occupied/vacant/booked]  | |  paid vs pending]          |      |
| +---------------------------+ +----------------------------+      |
|                                                                    |
| +---------------------------+ +----------------------------+      |
| | Recent Complaints         | | Upcoming Dues              |      |
| | [Compact 5-row table]     | | [Compact 5-row table]      |      |
| +---------------------------+ +----------------------------+      |
+------------------------------------------------------------------+
```

### New Dependency

Add `recharts` (^2.x) -- lightweight React charting library for donut and bar charts.

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/home/index.tsx` | MODIFY - Full rewrite with StatsCard, charts, FilterBar, compact DataTables |
| `src/pages/dashboardDetail/dashboard-cots-detail.tsx` | MODIFY - Use DataTable, PageHeader, Breadcrumbs |
| `src/pages/dashboardDetail/dashboard-complaints-detail.tsx` | MODIFY - Same |
| `src/pages/dashboardDetail/dashboard-payments-detail.tsx` | MODIFY - Same |
| `src/pages/dashboardDetail/dashboard-bookings-detail.tsx` | MODIFY - Same |
| `package.json` | MODIFY - Add `recharts` |

---

## Phase 5: Core Operations Pages

**Goal**: Redesign the 5 most-used pages: Admissions, Complaints, Branches, Checkout, Payments.

### Standard Page Pattern

Every operational page follows:
```tsx
<ContentArea>
  <PageHeader title="Complaints" description="Track and manage maintenance requests">
    <Button startIcon={<AddIcon/>}>New Complaint</Button>
    <ExportButton data={...} />
  </PageHeader>
  <FilterBar>
    <SelectField label="Branch" />
    <SelectField label="Status" />
    <DateRangeFilter />
    <SearchInput />
  </FilterBar>
  <DataTable columns={...} data={...} loading={...} />
  <DialogModal ... />
</ContentArea>
```

### Page-Specific Notes

**Admissions** (`src/pages/admissions/index.tsx`):
- MUI ToggleButtonGroup for Pending/Approved (replaces Tabs)
- DataTable with StatusBadge for admission status
- "Add New Admission" -> "Register New Resident"
- All "Candidate" labels -> "Resident"

**Admission Multi-Step** (`src/pages/admissions/admissionConfirm.tsx`):
- Theme MUI Stepper with Primary Blue
- Step labels: "Resident Details", "Emergency Contact", "Documents", "Purpose of Stay", "Room & Pricing", "Payment Setup", "Additional Details"
- All sub-components use FormField wrappers, MUI Grid2

**Complaints** (`src/pages/complaint/index.tsx`):
- FilterBar with branch, status, date range
- StatusBadge per complaint status
- Detail dialog with section dividers

**Branches** (`src/pages/branch/index.tsx`):
- Tabbed detail panel: "Details", "Rooms & Beds" (was "Rooms & Cots"), "Photos", "Amenities"

**Checkout** (`src/pages/vacate/index.tsx`):
- All "Vacate" labels -> "Checkout"
- Financial settlement with clear currency formatting

### Files to Modify (all MODIFY)

- `src/pages/admissions/index.tsx`
- `src/pages/admissions/admissionConfirm.tsx`
- `src/pages/admissions/admissionTransfer.tsx`
- `src/pages/admissions/candidatePayments.tsx`
- `src/pages/admissions/candidatePaymentDetails.tsx`
- `src/pages/admissions/ebCharges.tsx`
- `src/pages/admissions/components/candidateDetails.tsx`
- `src/pages/admissions/components/contactPerson.tsx`
- `src/pages/admissions/components/documents.tsx`
- `src/pages/admissions/components/purposeOfStay.tsx`
- `src/pages/admissions/components/roomAndFee.tsx`
- `src/pages/admissions/components/payments.tsx`
- `src/pages/admissions/components/others.tsx`
- `src/pages/complaint/index.tsx`
- `src/pages/branch/index.tsx`
- `src/pages/branch/components/branchDetails.tsx`
- `src/pages/branch/components/roomsAndCots.tsx`
- `src/pages/branch/components/branchPhotos.tsx`
- `src/pages/branch/components/branchAmenities.tsx`
- `src/pages/vacate/index.tsx`

---

## Phase 6: People & Feedback Pages

**Goal**: Redesign user management, service providers, restricted residents, feedback, attendance, announcements.

All follow the standard PageHeader + FilterBar + DataTable + DialogModal pattern.

### Files to Modify (all MODIFY)

| File | Notes |
|------|-------|
| `src/pages/userList/index.tsx` | User directory with inline edit/create dialog |
| `src/pages/userRolePageAccess/index.tsx` | Role selector + permission matrix with checkboxes |
| `src/pages/serviceProvider/index.tsx` | Category + type (Internal/External) filters |
| `src/pages/blackList/index.tsx` | Rename to "Restricted Residents", warning-accent page |
| `src/pages/feedBack/index.tsx` | Star ratings, MUI Rating component |
| `src/pages/attendance/index.tsx` | Date-based attendance grid |
| `src/pages/announcements/index.tsx` | Announcement cards with create/edit |

---

## Phase 7: Master Data / Configuration Pages

**Goal**: Redesign all 12+ master CRUD pages using a shared MasterCrudPage template.

### Generic Pattern

All master pages share identical structure: DataTable + create/edit form + toggle-active/delete. Instead of 12 separate implementations, use `MasterCrudPage.tsx`:

```tsx
<MasterCrudPage
  title="Room Types"
  description="Manage room classification types"
  columns={[
    { id: 'name', label: 'Type Name' },
    { id: 'isActive', label: 'Status', render: (row) => <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} /> },
  ]}
  formFields={[
    { name: 'name', label: 'Type Name', required: true },
  ]}
  apiGet={getMasterRoomType}
  apiSave={insertUpdateMasterRoomType}
  apiDelete={deleteMasterRoomType}
/>
```

### Files to Modify (all MODIFY)

- `src/pages/master/roomtype.tsx`
- `src/pages/master/bathroomType.tsx`
- `src/pages/master/cotType.tsx` (label: "Bed Types")
- `src/pages/master/SharingType.tsx`
- `src/pages/master/amenitiesCategory.tsx`
- `src/pages/master/amenitiesSubCategory.tsx`
- `src/pages/master/amenitiesFacilities.tsx`
- `src/pages/master/IssueCategories.tsx`
- `src/pages/master/IssuesSubCategories.tsx`
- `src/pages/master/PageList.tsx` (label: "Page Registry")
- `src/pages/master/MasterUserRole.tsx`
- `src/pages/master/serviceProviderCategory.tsx`
- `src/pages/master/bulkUpload.tsx` (use FileUpload component)

---

## Phase Dependencies

```
Phase 0 (Design System)
  |
  v
Phase 1 (Layout Architecture)     <- Must complete before any page work
  |
  v
Phase 2 (Shared Components)       <- Must complete before page redesigns
  |
  +---> Phase 3 (Login)           <- Independent, can parallel with 4-7
  +---> Phase 4 (Dashboard)       <- Independent
  +---> Phase 5 (Core Ops)        <- Do first -- most used pages
  +---> Phase 6 (People Pages)    <- Independent
  +---> Phase 7 (Master Pages)    <- Fastest, can be last
```

Phases 3-7 are independent once Phase 2 is done. Phase 5 should come first (most-used pages).

---

## File Inventory Summary

### New files (~25)
- `src/theme/` -- 5 files (tokens, palette, typography, components, index)
- `src/configs/navigation.ts` -- 1 file
- `src/components/layout/` -- 8 files (Sidebar, SidebarItem, SidebarGroup, TopHeader, Breadcrumbs, ContentArea, DashboardShell, UserMenu)
- `src/components/shared/` -- 17 files (DataTable, PageHeader, FilterBar, StatusBadge, SearchInput, SelectField, DateRangeFilter, FormField, DialogModal, ConfirmDialog, StatsCard, EmptyState, FileUpload, ExportButton, LoadingOverlay, MasterCrudPage, index)
- `src/assets/scss/` -- 2 files (layout.scss, utilities.scss)

### Modified files (~48)
- Theme/SCSS: AppThemeProvider, variables.scss, app.scss (3)
- Layout: dashboardLayout, authLayout (2)
- State: StateProvider, StateReducer (2)
- Services: HelperService, SkeletonProvider (2)
- Pages: ~39 page files across all directories
- package.json (1)

### Deleted files (~2)
- `src/components/layouts/dashboardNewHeader.tsx` (replaced by layout components)
- `src/components/helpers/CustomAbsoluteBox.tsx` (replaced by MUI Popover/Menu)

### Dependencies
- **Add**: `recharts` (^2.x) for dashboard charts
- **Remove**: `bootstrap` (replaced by MUI Grid2/Stack/Box)

---

## Verification Plan

After each phase, verify:

1. **Phase 0**: `npm run dev` starts without errors. All existing pages still render (may look inconsistent until phases 1-2).
2. **Phase 1**: Sidebar appears on all dashboard routes. All navigation links work. Mobile hamburger works. Breadcrumbs show correct path.
3. **Phase 2**: Import shared components in a test page. DataTable renders with loading, data, and empty states. StatusBadge shows correct colors.
4. **Phase 3**: Login page renders with new design. OTP flow works end-to-end.
5. **Phase 4**: Dashboard shows stats cards, charts render, filters work, drill-down links work.
6. **Phase 5**: Each page: CRUD operations work, filters work, pagination works, dialogs open/close, status badges display correctly.
7. **Phase 6-7**: Same verification as Phase 5 for remaining pages.

**Cross-cutting checks**:
- No Bootstrap classes remain in JSX
- No `#F76D61` salmon color appears anywhere
- No "Candidate" (should be "Resident"), "Cot" (should be "Bed"), "Vacate" (should be "Checkout") in UI text
- All pages accessible via sidebar navigation
- Responsive behavior works at mobile/tablet/desktop breakpoints
