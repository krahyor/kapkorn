/**
 * Common constants
 */

export const APP_NAME = 'เก็บของ - Admin Panel';

/**
 * Admin roles
 */
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STOCK_STAFF = 'stock_stafff',
  STAFF = 'staff',
}

/**
 * Admin permissions
 */
export enum AdminPermission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',

  // Doctor Management
  VIEW_DOCTORS = 'view_doctors',
  CREATE_DOCTORS = 'create_doctors',
  EDIT_DOCTORS = 'edit_doctors',
  DELETE_DOCTORS = 'delete_doctors',

  // Clinic Management
  VIEW_CLINICS = 'view_clinics',
  EDIT_CLINICS = 'edit_clinics',

  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
}

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
  [AdminRole.ADMIN]: [
    AdminPermission.VIEW_USERS,
    AdminPermission.CREATE_USERS,
    AdminPermission.EDIT_USERS,
    AdminPermission.VIEW_DOCTORS,
    AdminPermission.CREATE_DOCTORS,
    AdminPermission.EDIT_DOCTORS,
    AdminPermission.VIEW_CLINICS,
    AdminPermission.VIEW_REPORTS,
    AdminPermission.EXPORT_REPORTS,
  ],
  [AdminRole.STOCK_STAFF]: [
    AdminPermission.VIEW_USERS,
    AdminPermission.VIEW_DOCTORS,
    AdminPermission.VIEW_CLINICS,
    AdminPermission.VIEW_REPORTS,
  ],
  [AdminRole.STAFF]: [
    AdminPermission.VIEW_USERS,
    AdminPermission.VIEW_DOCTORS,
    AdminPermission.VIEW_CLINICS,
    AdminPermission.VIEW_REPORTS,
  ],
};

/**
 * Data table configuration
 */
export const DATA_TABLE = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const;

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 100,
  MEGA_PAGE_SIZE: 1000,
  HEAT_MAP_PAGE_SIZE: 225, // 15x15 grid for medical case heat map
} as const;

/**
 * User status labels (Thai)
 */
export const USER_STATUS_LABELS: Record<string, string> = {
  active: 'ใช้งาน',
  inactive: 'ไม่ใช้งาน',
  suspended: 'ระงับการใช้งาน',
} as const;

/**
 * Doctor status labels (Thai)
 */
export const DOCTOR_STATUS_LABELS: Record<string, string> = {
  active: 'ปฏิบัติงาน',
  inactive: 'ไม่ปฏิบัติงาน',
  on_leave: 'ลาพัก',
} as const;

/**
 * Service area status labels (Thai)
 */
export const SERVICE_AREA_STATUS_LABELS: Record<string, string> = {
  active: 'เปิดให้บริการ',
  inactive: 'ปิดให้บริการ',
} as const;

/**
 * Stock status labels (Thai)
 */
export const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: 'มีสินค้า',
  low_stock: 'ใกล้หมด',
  out_of_stock: 'หมดสต็อก',
} as const;

/**
 * Payment status labels (Thai)
 */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  paid: 'จ่ายแล้ว',
  cancelled: 'ยกเลิก',
} as const;

/**
 * Rider status labels (Thai)
 */
export const RIDER_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
  active: 'ใช้งาน',
  inactive: 'ไม่ใช้งาน',
  suspended: 'ระงับการใช้งาน',
} as const;

/**
 * Role labels (Thai)
 */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'ผู้ดูแลระบบสูงสุด',
  admin: 'ผู้ดูแลระบบ',
  stock_staff: 'เจ้าหน้าที่คลังยา',
} as const;

/**
 * Get badge variant for user status
 */
export function getUserStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'suspended':
      return 'destructive';
    default:
      return 'default';
  }
}



/**
 * Get badge variant for service area status
 */
export function getServiceAreaStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Get badge variant for stock status
 */
export function getStockStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get badge variant for payment status
 */
export function getPaymentStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
}



/**
 * Get badge variant for role
 */
export function getRoleBadgeVariant(
  role: string
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (role) {
    case 'super_admin':
      return 'destructive'; // Red for highest privilege
    case 'admin':
      return 'warning'; // Yellow for admin
    case 'staff':
      return 'default'; // Gray for staff
    default:
      return 'default';
  }
}
