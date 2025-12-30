/**
 * Navigation Configuration
 * Centralized navigation configuration for Morglaiban Admin Frontend
 */

import type { NavigationItem, NavigationGroup } from '@/types/common';

// =============================================================================
// Navigation Items
// =============================================================================

/**
 * Main navigation items
 */
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    name: 'แดชบอร์ด',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'ภาพรวมของระบบ',
  },
  {
    name: 'จัดการแพทย์',
    href: '/dashboard/doctors',
    icon: 'UserCheck',
    description: 'จัดการข้อมูลแพทย์',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'จัดการผู้ป่วย',
    href: '/dashboard/patients',
    icon: 'Users',
    description: 'จัดการข้อมูลผู้ป่วย',
    roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
  },
  {
    name: 'จัดการไรเดอร์',
    href: '/dashboard/riders',
    icon: 'Truck',
    description: 'จัดการข้อมูลไรเดอร์',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'พื้นที่บริการ',
    href: '/dashboard/service-areas',
    icon: 'MapPin',
    description: 'จัดการพื้นที่บริการ',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'คลังสินค้า',
    href: '/dashboard/stocks',
    icon: 'Package',
    description: 'จัดการคลังสินค้า',
    roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
  },
  {
    name: 'รายงาน',
    href: '/dashboard/reports',
    icon: 'FileText',
    description: 'ดูรายงานต่างๆ',
    roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
    children: [
      {
        name: 'ภาพรวม',
        href: '/dashboard/reports/overview',
        icon: 'BarChart3',
      },
      {
        name: 'รายงานผู้ป่วย',
        href: '/dashboard/reports/patients',
        icon: 'Users',
      },
      {
        name: 'รายงานไรเดอร์',
        href: '/dashboard/reports/riders',
        icon: 'Truck',
      },
      {
        name: 'รายงานบริการ',
        href: '/dashboard/reports/services',
        icon: 'Activity',
      },
    ],
  },
];

/**
 * Secondary navigation items
 */
export const SECONDARY_NAVIGATION: NavigationItem[] = [
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: 'User',
    description: 'User profile settings',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    description: 'Application settings',
  },
  {
    name: 'Help',
    href: '/help',
    icon: 'HelpCircle',
    description: 'Get help and support',
    isExternal: true,
  },
  {
    name: 'Contact',
    href: '/contact',
    icon: 'Phone',
    description: 'Contact support',
    isExternal: true,
  },
];

/**
 * Footer navigation items
 */
export const FOOTER_NAVIGATION: NavigationItem[] = [
  {
    name: 'Privacy Policy',
    href: '/privacy',
    icon: 'Shield',
    description: 'Privacy policy',
    isExternal: true,
  },
  {
    name: 'Terms of Service',
    href: '/terms',
    icon: 'FileText',
    description: 'Terms of service',
    isExternal: true,
  },
  {
    name: 'Cookie Policy',
    href: '/cookie-policy',
    icon: 'Cookie',
    description: 'Cookie policy',
    isExternal: true,
  },
];

// =============================================================================
// Navigation Groups
// =============================================================================

/**
 * Grouped navigation for sidebar
 */
export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: 'Main',
    items: MAIN_NAVIGATION,
  },
  {
    title: 'Secondary',
    items: SECONDARY_NAVIGATION,
  },
];

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/error',
  '/maintenance',
] as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/doctors',
  '/dashboard/patients',
  '/dashboard/riders',
  '/dashboard/service-areas',
  '/dashboard/stocks',
  '/dashboard/reports',
  '/dashboard/profile',
  '/dashboard/settings',
] as const;

/**
 * Admin routes (admin role required)
 */
export const ADMIN_ROUTES = [
  '/dashboard/doctors',
  '/dashboard/patients',
  '/dashboard/riders',
  '/dashboard/service-areas',
  '/dashboard/stocks',
  '/dashboard/reports',
] as const;

/**
 * Super admin routes (super admin role required)
 */
export const SUPER_ADMIN_ROUTES = [
  '/dashboard/doctors',
  '/dashboard/patients',
  '/dashboard/riders',
  '/dashboard/service-areas',
] as const;

// =============================================================================
// Navigation Utilities
// =============================================================================

/**
 * Check if route is public
 */
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
};

/**
 * Check if route is protected
 */
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
};

/**
 * Check if route requires admin role
 */
export const isAdminRoute = (path: string): boolean => {
  return ADMIN_ROUTES.some((route) => path.startsWith(route));
};

/**
 * Check if route requires super admin role
 */
export const isSuperAdminRoute = (path: string): boolean => {
  return SUPER_ADMIN_ROUTES.some((route) => path.startsWith(route));
};

/**
 * Get navigation items for user role
 */
export const getNavigationForRole = (role: string): NavigationItem[] => {
  return MAIN_NAVIGATION.filter((item) => {
    if (!item.roles) {
      return true;
    }
    return item.roles.includes(role);
  });
};

/**
 * Get active navigation item
 */
export const getActiveNavigationItem = (path: string): NavigationItem | undefined => {
  const allItems = [...MAIN_NAVIGATION, ...SECONDARY_NAVIGATION];

  return allItems.find((item) => {
    if (item.href === path) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => child.href === path);
    }
    return false;
  });
};

// =============================================================================
// Default Export
// =============================================================================

export const navigationConfig = {
  main: MAIN_NAVIGATION,
  secondary: SECONDARY_NAVIGATION,
  footer: FOOTER_NAVIGATION,
  groups: NAVIGATION_GROUPS,
  routes: {
    public: PUBLIC_ROUTES,
    protected: PROTECTED_ROUTES,
    admin: ADMIN_ROUTES,
    superAdmin: SUPER_ADMIN_ROUTES,
  },
  utils: {
    isPublicRoute,
    isProtectedRoute,
    isAdminRoute,
    isSuperAdminRoute,
    getNavigationForRole,
    getActiveNavigationItem,
  },
} as const;

export default navigationConfig;
