import { ROUTES } from './constants';

export interface NavItem {
  label: string;
  path?: string;
  icon: string; // lucide-react icon name
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: ROUTES.HOME.DASHBOARD },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        label: 'Admissions',
        icon: 'UserPlus',
        children: [
          { label: 'All Admissions', icon: 'UserPlus', path: ROUTES.HOME.ADMISSION.LIST },
          { label: 'Confirmation', icon: 'UserPlus', path: ROUTES.HOME.ADMISSION.CONFIRMATION },
          { label: 'Transfer', icon: 'UserPlus', path: ROUTES.HOME.ADMISSION.TRANSFER },
          { label: 'Resident Payments', icon: 'UserPlus', path: ROUTES.HOME.ADMISSION.PAYMENTS },
          { label: 'Utility Charges', icon: 'UserPlus', path: ROUTES.HOME.ADMISSION.EB_CHARGES },
        ],
      },
      { label: 'Complaints', icon: 'AlertCircle', path: ROUTES.HOME.COMPLAINTS },
      { label: 'Checkout', icon: 'LogOut', path: ROUTES.HOME.VACATE },
      { label: 'Branches', icon: 'Building2', path: ROUTES.HOME.BRANCH },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      {
        label: 'Users & Access',
        icon: 'Shield',
        children: [
          { label: 'User Directory', icon: 'Shield', path: ROUTES.HOME.USER.LIST },
          { label: 'Role Permissions', icon: 'Shield', path: ROUTES.HOME.USER.ROLE },
          { label: 'Service Providers', icon: 'Shield', path: ROUTES.HOME.USER.SERVICE_PROVIDER },
        ],
      },
      { label: 'Restricted Residents', icon: 'Ban', path: ROUTES.HOME.BLACKLIST },
      { label: 'Feedback', icon: 'MessageSquare', path: ROUTES.HOME.FEEDBACK },
      { label: 'Attendance', icon: 'CalendarCheck', path: ROUTES.HOME.ATTENDANCE },
      { label: 'Announcements', icon: 'Megaphone', path: ROUTES.HOME.ANNOUNCEMENTS },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      {
        label: 'Master Data',
        icon: 'Settings',
        children: [
          { label: 'Room Types', icon: 'Settings', path: ROUTES.HOME.MASTER.ROOM_TYPE },
          { label: 'Bed Types', icon: 'Settings', path: ROUTES.HOME.MASTER.COT_TYPE },
          { label: 'Sharing Types', icon: 'Settings', path: ROUTES.HOME.MASTER.SHARING_TYPE },
          { label: 'Bathroom Types', icon: 'Settings', path: ROUTES.HOME.MASTER.BATHROOM_TYPE },
          { label: 'Amenity Categories', icon: 'Settings', path: ROUTES.HOME.MASTER.AMENITIES_CATEGORIES },
          { label: 'Amenity Sub-Categories', icon: 'Settings', path: ROUTES.HOME.MASTER.AMENITIES_SUB_CATEGORIES },
          { label: 'Amenity Facilities', icon: 'Settings', path: ROUTES.HOME.MASTER.AMENITIES_FACILITIES },
          { label: 'Issue Categories', icon: 'Settings', path: ROUTES.HOME.MASTER.ISSUE_CATEGORIES },
          { label: 'Issue Sub-Categories', icon: 'Settings', path: ROUTES.HOME.MASTER.ISSUE_SUB_CATEGORIES },
          { label: 'Page Registry', icon: 'Settings', path: ROUTES.HOME.MASTER.PAGE_LIST },
          { label: 'User Roles', icon: 'Settings', path: ROUTES.HOME.MASTER.MASTER_USER_ROLE },
          { label: 'Provider Categories', icon: 'Settings', path: ROUTES.HOME.MASTER.SERVICE_PROVIDER_CATEGORY },
          { label: 'Bulk Import', icon: 'Settings', path: ROUTES.HOME.MASTER.BULK_UPLOAD },
        ],
      },
    ],
  },
];

// Flat map of path -> label for breadcrumbs
export function getNavLabel(path: string): string | null {
  for (const section of navigationConfig) {
    for (const item of section.items) {
      if (item.path === path) return item.label;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) return child.label;
        }
      }
    }
  }
  return null;
}

// Get parent label for a child path (for breadcrumbs)
export function getNavParent(path: string): { section: string; parent?: string; label: string } | null {
  for (const section of navigationConfig) {
    for (const item of section.items) {
      if (item.path === path) {
        return { section: section.title, label: item.label };
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return { section: section.title, parent: item.label, label: child.label };
          }
        }
      }
    }
  }
  return null;
}
