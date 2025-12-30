/**
 * Common Types
 * Shared type definitions used across the Morglaiban admin frontend application.
 *
 * This file contains core interfaces and types that are used throughout the application
 * for consistent data structures, API responses, and UI components.
 */

/**
 * Standard API response structure used throughout the application
 *
 * @template T - Type of the data payload
 *
 * @example
 * ```tsx
 * // API call returning user data
 * const response: ApiResponse<User> = await fetchUser();
 * if (response.success) {
 *   console.log(response.data.email);
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Error response
 * const errorResponse: ApiResponse<null> = {
 *   data: null,
 *   success: false,
 *   message: 'Validation failed',
 *   errors: {
 *     email: 'Email is required',
 *     password: 'Password too short'
 *   }
 * };
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** Main data payload of the response */
  data: T;
  /** Human-readable message describing the result */
  message: string;
  /** Whether the operation was successful */
  success: boolean;
  /** Field-specific validation errors, if any */
  errors?: Record<string, string>;
  /** Non-blocking warnings, if any */
  warnings?: Record<string, string>;
  /** Additional metadata about the response */
  meta?: {
    /** Pagination information for list responses */
    pagination?: {
      /** Current page number (1-based) */
      page: number;
      /** Number of items per page */
      limit: number;
      /** Total number of items available */
      total: number;
      /** Total number of pages available */
      totalPages: number;
    };
    /** ISO timestamp of when the response was generated */
    timestamp?: string;
    /** Unique identifier for tracing requests */
    requestId?: string;
  };
}

/**
 * Paginated response wrapper for list endpoints
 *
 * @template T - Type of items in the results array
 *
 * @example
 * ```tsx
 * // API response for users list
 * const usersResponse: PaginatedResponse<User> = await fetchUsers();
 * console.log(usersResponse.data.results); // Array of User objects
 * ```
 */
export interface PaginatedResponse<T> {
  /** Wrapper containing the paginated results */
  data: {
    /** Array of items for the current page */
    results: T[];
  };
}

/**
 * Standard option interface for select/dropdown components
 *
 * @template T - Type of the option value (defaults to string)
 *
 * @example
 * ```tsx
 * // Basic usage
 * const statusOptions: SelectOption[] = [
 *   { label: 'Active', value: 'active' },
 *   { label: 'Inactive', value: 'inactive' }
 * ];
 *
 * // With custom value type
 * const userOptions: SelectOption<User> = [
 *   { label: 'John Doe', value: { id: '1', name: 'John' } }
 * ];
 *
 * // Grouped options
 * const roleOptions: SelectOption[] = [
 *   { label: 'Admin', value: 'admin', group: 'Management' },
 *   { label: 'Staff', value: 'staff', group: 'Operations' }
 * ];
 * ```
 */
export interface SelectOption<T = string> {
  /** Display text shown to users */
  label: string;
  /** Internal value associated with the option */
  value: T;
  /** Whether the option should be disabled */
  disabled?: boolean;
  /** Additional descriptive text shown as helper */
  description?: string;
  /** Group name for organizing options in categories */
  group?: string;
}

/**
 * Table column configuration for data tables
 *
 * @template T - Type of data row
 *
 * @example
 * ```tsx
 * const userColumns: TableColumn<User>[] = [
 *   {
 *     key: 'name',
 *     header: 'Full Name',
 *     accessor: (row) => `${row.first_name} ${row.last_name}`,
 *     sortable: true,
 *     filterable: true
 *   },
 *   {
 *     key: 'status',
 *     header: 'Status',
 *     render: (value, row) => (
 *       <Badge variant={row.is_active ? 'success' : 'error'}>
 *         {value}
 *       </Badge>
 *     ),
 *     width: 120
 *   }
 * ];
 * ```
 */
export interface TableColumn<T = unknown> {
  /** Unique identifier for the column */
  key: string;
  /** Header text displayed in the table */
  header: string;
  /** Function to extract/display data from row */
  accessor?: (row: T) => unknown;
  /** Whether column can be sorted */
  sortable?: boolean;
  /** Whether column can be filtered */
  filterable?: boolean;
  /** Fixed width for the column */
  width?: string | number;
  /** CSS classes applied to column cells */
  className?: string;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface SearchFilters {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error: Error | string | null;
  message?: string;
}

export interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Theme = 'light' | 'dark' | 'system';

export type Language = 'en' | 'th' | 'zh' | 'es';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  autoClose?: number;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  filters?: SearchFilters;
  columns?: string[];
  includeHeaders?: boolean;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: string[];
  isActive?: boolean;
  isExternal?: boolean;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string | number;
    message: string;
  };
}
