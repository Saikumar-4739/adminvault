-- Database Schema for AdminVault
-- Generated based on backend entities

-- 1. AUTHENTICATION & USERS
CREATE TABLE IF NOT EXISTS `auth_users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key for auth users',
    `full_name` VARCHAR(255) NOT NULL COMMENT 'Full name of the user',
    `company_id` BIGINT NOT NULL COMMENT 'Reference to company_info table',
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',
    `ph_number` VARCHAR(20) DEFAULT NULL COMMENT 'Phone number',
    `password_hash` TEXT NOT NULL COMMENT 'Hashed password',
    `user_role` ENUM('ADMIN', 'USER', 'MANAGER') DEFAULT 'USER' NOT NULL COMMENT 'Legacy user role',
    `status` BOOLEAN DEFAULT TRUE NOT NULL COMMENT 'User active status',
    `last_login` TIMESTAMP DEFAULT NULL COMMENT 'Last login timestamp',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    INDEX `idx_auth_email` (`email`),
    INDEX `idx_auth_company` (`company_id`),
    INDEX `idx_auth_role` (`user_role`),
    INDEX `idx_auth_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL,
    `is_system_role` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `company_id` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_role_code` (`code`),
    INDEX `idx_role_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `permissions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_perm_code` (`code`),
    INDEX `idx_perm_resource` (`resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `permission_id`),
    INDEX `idx_rp_role` (`role_id`),
    INDEX `idx_rp_perm` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. MASTER DATA
CREATE TABLE IF NOT EXISTS `company_info` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `company_name` VARCHAR(255) NOT NULL COMMENT 'Name of the company',
    `location` VARCHAR(255) NOT NULL COMMENT 'Company location',
    `est_date` VARCHAR(255) NOT NULL COMMENT 'Company establishment date',
    `email` VARCHAR(255) DEFAULT NULL COMMENT 'Company email',
    `phone` VARCHAR(50) DEFAULT NULL COMMENT 'Company phone number',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_company_name` (`company_name`),
    INDEX `idx_company_company` (`company_id`),
    INDEX `idx_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `departments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Department name',
    `description` TEXT DEFAULT NULL COMMENT 'Department description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether department is active',
    `code` VARCHAR(50) DEFAULT NULL COMMENT 'Department code',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_dept_name` (`name`),
    INDEX `idx_dept_code` (`code`),
    INDEX `idx_dept_company` (`company_id`),
    INDEX `idx_dept_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `locations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Location name',
    `description` TEXT DEFAULT NULL COMMENT 'Location description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether location is active',
    `address` TEXT DEFAULT NULL COMMENT 'Location address',
    `city` VARCHAR(100) DEFAULT NULL COMMENT 'Location city',
    `country` VARCHAR(100) DEFAULT NULL COMMENT 'Location country',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_location_name` (`name`),
    INDEX `idx_location_company` (`company_id`),
    INDEX `idx_location_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `device_brands` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Brand name',
    `description` TEXT DEFAULT NULL COMMENT 'Brand description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether brand is active',
    `status` VARCHAR(100) DEFAULT NULL COMMENT 'Brand status',
    `logo` VARCHAR(500) DEFAULT NULL COMMENT 'Brand logo URL',
    `code` VARCHAR(50) DEFAULT NULL COMMENT 'Brand code',
    `website` VARCHAR(500) DEFAULT NULL COMMENT 'Brand website URL',
    `rating` DECIMAL(3,2) DEFAULT NULL COMMENT 'Brand rating (0-5)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_brand_name` (`name`),
    INDEX `idx_brand_company` (`company_id`),
    INDEX `idx_brand_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vendors` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Vendor name',
    `description` TEXT DEFAULT NULL COMMENT 'Vendor description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether vendor is active',
    `contact_person` VARCHAR(255) DEFAULT NULL COMMENT 'Contact person name',
    `email` VARCHAR(255) DEFAULT NULL COMMENT 'Vendor email address',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Vendor phone number',
    `address` TEXT DEFAULT NULL COMMENT 'Vendor address',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_vendor_name` (`name`),
    INDEX `idx_vendor_company` (`company_id`),
    INDEX `idx_vendor_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `device_info` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `device_type` ENUM('LAPTOP', 'DESKTOP', 'MONITOR', 'TABLET', 'MOBILE', 'PRINTER', 'OTHER') NOT NULL COMMENT 'Type of device',
    `device_name` VARCHAR(255) NOT NULL COMMENT 'Name of the device',
    `model` VARCHAR(255) DEFAULT NULL COMMENT 'Device model',
    `brand_name` VARCHAR(255) DEFAULT NULL COMMENT 'Device brand name',
    `services_tag` VARCHAR(255) DEFAULT NULL COMMENT 'Device service tag',
    `configuration` TEXT DEFAULT NULL COMMENT 'Device configuration details',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_device_type` (`device_type`),
    INDEX `idx_device_name` (`device_name`),
    INDEX `idx_device_company` (`company_id`),
    INDEX `idx_device_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `asset_types` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Asset type name',
    `description` TEXT DEFAULT NULL COMMENT 'Asset type description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether asset type is active',
    `status` VARCHAR(100) DEFAULT NULL COMMENT 'Asset type status',
    `code` VARCHAR(50) DEFAULT NULL COMMENT 'Asset type code',
    `logo` VARCHAR(500) DEFAULT NULL COMMENT 'Asset type logo URL',
    `website` VARCHAR(500) DEFAULT NULL COMMENT 'Asset type website URL',
    `contact_person` VARCHAR(255) DEFAULT NULL COMMENT 'Contact person name',
    `contact_number` VARCHAR(20) DEFAULT NULL COMMENT 'Contact phone number',
    `email` VARCHAR(255) DEFAULT NULL COMMENT 'Contact email address',
    `address` TEXT DEFAULT NULL COMMENT 'Contact address',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_asset_type_name` (`name`),
    INDEX `idx_asset_type_code` (`code`),
    INDEX `idx_asset_type_company` (`company_id`),
    INDEX `idx_asset_type_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `applications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Application name',
    `description` TEXT DEFAULT NULL COMMENT 'Application description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether application is active',
    `owner_name` VARCHAR(255) DEFAULT NULL COMMENT 'Application owner name',
    `app_release_date` DATE DEFAULT NULL COMMENT 'Application release date',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_app_name` (`name`),
    INDEX `idx_app_company` (`company_id`),
    INDEX `idx_app_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `expense_categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Expense category name',
    `description` TEXT DEFAULT NULL COMMENT 'Expense category description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether expense category is active',
    `category_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of expense category',
    `budget_limit` DECIMAL(10,2) DEFAULT NULL COMMENT 'Budget limit for this category',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_expense_cat_name` (`name`),
    INDEX `idx_expense_cat_company` (`company_id`),
    INDEX `idx_expense_cat_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `it_admin` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `admin_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique admin code',
    `name` VARCHAR(255) NOT NULL COMMENT 'Admin full name',
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Admin email address',
    `ph_number` VARCHAR(20) DEFAULT NULL COMMENT 'Admin phone number',
    `role_enum` ENUM('SUPER_ADMIN', 'IT_MANAGER', 'IT_SUPPORT', 'VIEWER') NOT NULL COMMENT 'Admin role',
    `permissions` JSON DEFAULT NULL COMMENT 'Admin permissions as JSON',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE' NOT NULL COMMENT 'Admin account status',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_admin_role` (`role_enum`),
    INDEX `idx_admin_status` (`status`),
    INDEX `idx_admin_code` (`admin_code`),
    INDEX `idx_admin_email` (`email`),
    INDEX `idx_admin_company` (`company_id`),
    INDEX `idx_admin_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ticket_categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL COMMENT 'Ticket category name',
    `description` TEXT DEFAULT NULL COMMENT 'Ticket category description',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether ticket category is active',
    `status` VARCHAR(255) DEFAULT NULL COMMENT 'Ticket category status',
    `default_priority` ENUM('Low', 'Medium', 'High') DEFAULT NULL COMMENT 'Default priority for this category',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ticket_cat_name` (`name`),
    INDEX `idx_ticket_cat_company` (`company_id`),
    INDEX `idx_ticket_cat_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ASSETS & EMPLOYEES
CREATE TABLE IF NOT EXISTS `employees` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `first_name` VARCHAR(100) NOT NULL COMMENT 'Employee first name',
    `last_name` VARCHAR(100) NOT NULL COMMENT 'Employee last name',
    `email` VARCHAR(255) NOT NULL COMMENT 'Employee email address',
    `ph_number` VARCHAR(20) DEFAULT NULL COMMENT 'Employee phone number',
    `emp_status` ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED') DEFAULT 'ACTIVE' NOT NULL COMMENT 'Employee employment status',
    `billing_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Employee billing amount',
    `department_id` INT NOT NULL COMMENT 'Department ID from departments master table',
    `remarks` TEXT DEFAULT NULL COMMENT 'Additional remarks about employee',
    `slack_user_id` VARCHAR(100) DEFAULT NULL COMMENT 'Slack workspace user ID',
    `slack_display_name` VARCHAR(255) DEFAULT NULL COMMENT 'Display name in Slack',
    `slack_avatar` VARCHAR(500) DEFAULT NULL COMMENT 'Slack Avatar URL',
    `is_slack_active` BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Whether slack user is active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_emp_email` (`email`),
    INDEX `idx_emp_dept_id` (`department_id`),
    INDEX `idx_emp_slack_id` (`slack_user_id`),
    INDEX `idx_emp_status` (`emp_status`),
    INDEX `idx_emp_company` (`company_id`),
    INDEX `idx_emp_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `asset_info` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `device_id` BIGINT NOT NULL COMMENT 'Reference to device_info table',
    `brand_id` BIGINT DEFAULT NULL COMMENT 'Reference to brand master table',
    `model` VARCHAR(255) DEFAULT NULL COMMENT 'Asset model',
    `serial_number` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Asset serial number / Service Tag',
    `express_code` VARCHAR(255) DEFAULT NULL COMMENT 'Dell Express Service Code',
    `box_no` VARCHAR(100) DEFAULT NULL COMMENT 'Physical box/storage location number',
    `configuration` TEXT DEFAULT NULL COMMENT 'Asset configuration details',
    `assigned_to_employee_id` BIGINT DEFAULT NULL COMMENT 'Reference to employees table - current user',
    `previous_user_employee_id` BIGINT DEFAULT NULL COMMENT 'Reference to employees table - previous user',
    `purchase_date` VARCHAR(255) DEFAULT NULL COMMENT 'Asset purchase date',
    `warranty_expiry` VARCHAR(255) DEFAULT NULL COMMENT 'Warranty expiration date',
    `asset_status_enum` ENUM('AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'RETIRED', 'SCRAPPED') DEFAULT 'AVAILABLE' NOT NULL COMMENT 'Current asset status',
    `user_assigned_date` DATE DEFAULT NULL COMMENT 'Date when asset was assigned to current user',
    `last_return_date` DATE DEFAULT NULL COMMENT 'Date when asset was last returned',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_asset_serial` (`serial_number`),
    INDEX `idx_asset_device` (`device_id`),
    INDEX `idx_asset_brand` (`brand_id`),
    INDEX `idx_asset_assigned_to` (`assigned_to_employee_id`),
    INDEX `idx_asset_status` (`asset_status_enum`),
    INDEX `idx_asset_company` (`company_id`),
    INDEX `idx_asset_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `asset_assign` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `asset_id` BIGINT NOT NULL COMMENT 'Reference to asset_info table',
    `employee_id` BIGINT NOT NULL COMMENT 'Reference to employees table',
    `assigned_by_id` BIGINT NOT NULL COMMENT 'Reference to it_admin table',
    `assigned_date` DATE NOT NULL COMMENT 'Date when asset was assigned',
    `return_date` DATE DEFAULT NULL COMMENT 'Date when asset was returned',
    `is_current` BOOLEAN DEFAULT TRUE COMMENT 'Whether this is the current assignment',
    `remarks` TEXT DEFAULT NULL COMMENT 'Additional remarks about assignment',
    `return_remarks` TEXT DEFAULT NULL COMMENT 'Remarks when asset was returned',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_assign_asset` (`asset_id`),
    INDEX `idx_assign_employee` (`employee_id`),
    INDEX `idx_assign_by` (`assigned_by_id`),
    INDEX `idx_assign_company` (`company_id`),
    INDEX `idx_assign_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `asset_return_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `asset_id` BIGINT NOT NULL COMMENT 'Reference to asset_info table',
    `employee_id` BIGINT NOT NULL COMMENT 'Reference to employees table - who returned the asset',
    `return_date` DATE NOT NULL COMMENT 'Date when asset was returned',
    `return_reason` TEXT DEFAULT NULL COMMENT 'Reason for returning the asset',
    `asset_condition` VARCHAR(50) DEFAULT NULL COMMENT 'Condition of asset on return (Good/Fair/Poor)',
    `remarks` TEXT DEFAULT NULL COMMENT 'Additional remarks about the return',
    `allocation_date` DATE DEFAULT NULL COMMENT 'Original allocation date for reference',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_return_asset` (`asset_id`),
    INDEX `idx_return_employee` (`employee_id`),
    INDEX `idx_return_date` (`return_date`),
    INDEX `idx_return_company` (`company_id`),
    INDEX `idx_return_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `asset_next_assignment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `employee_id` BIGINT NOT NULL COMMENT 'Reference to employees table - who will receive the asset',
    `asset_type` VARCHAR(100) NOT NULL COMMENT 'Type of asset needed (Laptop/Desktop/Monitor/etc)',
    `request_date` DATE NOT NULL COMMENT 'Date when assignment request was made',
    `expected_date` DATE DEFAULT NULL COMMENT 'Expected date for asset assignment',
    `assigned_asset_id` BIGINT DEFAULT NULL COMMENT 'Reference to asset_info table - asset allocated',
    `status` ENUM('PENDING', 'APPROVED', 'ALLOCATED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' NOT NULL COMMENT 'Current status of assignment request',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM' COMMENT 'Priority level of assignment',
    `remarks` TEXT DEFAULT NULL COMMENT 'Additional remarks about the assignment request',
    `requested_by_id` BIGINT DEFAULT NULL COMMENT 'Reference to user who created the request',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_next_assign_employee` (`employee_id`),
    INDEX `idx_next_assign_status` (`status`),
    INDEX `idx_next_assign_priority` (`priority`),
    INDEX `idx_next_assign_asset` (`assigned_asset_id`),
    INDEX `idx_next_assign_requester` (`requested_by_id`),
    INDEX `idx_next_assign_company` (`company_id`),
    INDEX `idx_next_assign_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TICKETS
CREATE TABLE IF NOT EXISTS `tickets` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `ticket_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique ticket code',
    `employee_id` BIGINT NOT NULL COMMENT 'Reference to employees table',
    `assign_admin_id` BIGINT DEFAULT NULL COMMENT 'Reference to it_admin table',
    `category_enum` ENUM('HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER') NOT NULL COMMENT 'Ticket category',
    `priority_enum` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL COMMENT 'Ticket priority level',
    `subject` TEXT NOT NULL COMMENT 'Ticket subject',
    `description` TEXT DEFAULT NULL COMMENT 'Detailed ticket description',
    `response` TEXT DEFAULT NULL COMMENT 'Admin response summary',
    `ticket_status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED') DEFAULT 'OPEN' NOT NULL COMMENT 'Current ticket status',
    `resolved_at` TIMESTAMP DEFAULT NULL COMMENT 'Timestamp when ticket was resolved',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ticket_emp` (`employee_id`),
    INDEX `idx_ticket_status` (`ticket_status`),
    INDEX `idx_ticket_category` (`category_enum`),
    INDEX `idx_ticket_priority` (`priority_enum`),
    INDEX `idx_ticket_assignee` (`assign_admin_id`),
    INDEX `idx_ticket_code` (`ticket_code`),
    INDEX `idx_ticket_company` (`company_id`),
    INDEX `idx_ticket_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ticket_comments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `ticket_id` BIGINT NOT NULL COMMENT 'Reference to tickets table',
    `comment` TEXT NOT NULL COMMENT 'Comment text',
    `comment_by` ENUM('EMPLOYEE', 'ADMIN', 'SYSTEM') NOT NULL COMMENT 'Who made the comment',
    `commented_by_id` BIGINT NOT NULL COMMENT 'ID of the person who commented',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_comment_ticket` (`ticket_id`),
    INDEX `idx_comment_by_id` (`commented_by_id`),
    INDEX `idx_comment_company` (`company_id`),
    INDEX `idx_comment_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ticket_status_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `ticket_id` BIGINT NOT NULL COMMENT 'Reference to tickets table',
    `old_status_enum` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED') NOT NULL COMMENT 'Previous ticket status',
    `new_status_enum` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED') NOT NULL COMMENT 'New ticket status',
    `changed_by_admin_id` BIGINT NOT NULL COMMENT 'Reference to it_admin table',
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when status was changed',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_status_log_ticket` (`ticket_id`),
    INDEX `idx_status_log_admin` (`changed_by_admin_id`),
    INDEX `idx_status_log_company` (`company_id`),
    INDEX `idx_status_log_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ADMINISTRATION & OTHERS
CREATE TABLE IF NOT EXISTS `email_info` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address',
    `email_type` ENUM('PERSONAL', 'OFFICIAL', 'GROUP', 'SERVICE') NOT NULL COMMENT 'Type of email',
    `department` ENUM('IT', 'HR', 'FINANCE', 'SALES', 'MARKETING', 'OPERATIONS') DEFAULT NULL COMMENT 'Department associated with email',
    `employee_id` BIGINT DEFAULT NULL COMMENT 'Reference to employees table',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE' NOT NULL COMMENT 'Email account status',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email_info_dept` (`department`),
    INDEX `idx_email_info_type` (`email_type`),
    INDEX `idx_email_info_status` (`status`),
    INDEX `idx_email_info_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `password_vault` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key for password vault',
    `title` VARCHAR(255) NOT NULL COMMENT 'Title/name of the password entry',
    `username` VARCHAR(255) DEFAULT NULL COMMENT 'Username for the service',
    `email` VARCHAR(255) DEFAULT NULL COMMENT 'Email for the service',
    `encrypted_password` TEXT NOT NULL COMMENT 'Encrypted password',
    `url` VARCHAR(500) DEFAULT NULL COMMENT 'URL of the service',
    `category` VARCHAR(100) DEFAULT NULL COMMENT 'Category (e.g., Social, Work, Banking)',
    `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
    `is_favorite` BOOLEAN DEFAULT FALSE COMMENT 'Is this a favorite entry',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Is this entry active',
    `company_id` BIGINT NOT NULL COMMENT 'Company ID',
    `created_by` BIGINT NOT NULL COMMENT 'User who created this entry',
    `last_accessed` TIMESTAMP DEFAULT NULL COMMENT 'Last time password was accessed',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX `idx_vault_company` (`company_id`),
    INDEX `idx_vault_creator` (`created_by`),
    INDEX `idx_vault_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `documents` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1 COMMENT 'Company ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT 'Stored file name',
    `original_name` VARCHAR(255) NOT NULL COMMENT 'Original file name',
    `file_size` BIGINT NOT NULL COMMENT 'File size in bytes',
    `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME type of the file',
    `category` VARCHAR(100) DEFAULT NULL COMMENT 'Document category',
    `file_path` VARCHAR(500) NOT NULL COMMENT 'File storage path',
    `uploaded_by` BIGINT NOT NULL COMMENT 'User ID who uploaded',
    `description` TEXT DEFAULT NULL COMMENT 'Document description',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT 'Comma-separated tags',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_document_category` (`category`),
    INDEX `idx_document_company` (`company_id`),
    INDEX `idx_document_uploader` (`uploaded_by`),
    INDEX `idx_document_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `licenses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `application_id` BIGINT NOT NULL,
    `assigned_date` DATE DEFAULT NULL,
    `expiry_date` DATE DEFAULT NULL,
    `remarks` TEXT DEFAULT NULL,
    `assigned_employee_id` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_license_app` (`application_id`),
    INDEX `idx_license_employee` (`assigned_employee_id`),
    INDEX `idx_license_expiry` (`expiry_date`),
    INDEX `idx_license_company` (`company_id`),
    INDEX `idx_license_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key for settings',
    `key` VARCHAR(255) NOT NULL COMMENT 'Setting key',
    `value` TEXT NOT NULL COMMENT 'Setting value (JSON)',
    `type` ENUM('SYSTEM', 'COMPANY', 'USER') DEFAULT 'USER' COMMENT 'Setting type',
    `category` VARCHAR(100) DEFAULT NULL COMMENT 'Setting category',
    `description` TEXT DEFAULT NULL COMMENT 'Setting description',
    `company_id` BIGINT DEFAULT NULL COMMENT 'Company ID (for company settings)',
    `user_id` BIGINT DEFAULT NULL COMMENT 'User ID (for user settings)',
    `is_encrypted` BOOLEAN DEFAULT FALSE COMMENT 'Is value encrypted',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX `idx_settings_key` (`key`),
    INDEX `idx_settings_user` (`userId`),
    INDEX `idx_settings_company` (`company_id`),
    INDEX `idx_settings_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_login_sessions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT DEFAULT NULL,
    `company_id` BIGINT NOT NULL DEFAULT 1,
    `session_token` TEXT DEFAULT NULL COMMENT 'Unique session identifier / JWT',
    `login_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When user logged in',
    `logout_timestamp` TIMESTAMP DEFAULT NULL COMMENT 'When user logged out',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Whether session is currently active',
    `ip_address` VARCHAR(45) NOT NULL COMMENT 'User IP address (IPv4/IPv6)',
    `country` VARCHAR(100) DEFAULT NULL COMMENT 'Country name',
    `region` VARCHAR(100) DEFAULT NULL COMMENT 'State/Region name',
    `city` VARCHAR(100) DEFAULT NULL COMMENT 'City name',
    `district` VARCHAR(100) DEFAULT NULL COMMENT 'District/County name',
    `location_name` VARCHAR(255) DEFAULT NULL COMMENT 'Specific location/place name (e.g., hotel, building)',
    `road` VARCHAR(255) DEFAULT NULL COMMENT 'Road/Street name',
    `suburb` VARCHAR(100) DEFAULT NULL COMMENT 'Suburb/Neighborhood name',
    `postcode` VARCHAR(20) DEFAULT NULL COMMENT 'Postal/ZIP code',
    `full_address` TEXT DEFAULT NULL COMMENT 'Complete formatted address',
    `latitude` DECIMAL(10,8) DEFAULT NULL COMMENT 'Latitude coordinate',
    `longitude` DECIMAL(11,8) DEFAULT NULL COMMENT 'Longitude coordinate',
    `timezone` VARCHAR(50) DEFAULT NULL COMMENT 'Timezone identifier',
    `user_agent` TEXT DEFAULT NULL COMMENT 'Full user agent string',
    `device_type` VARCHAR(50) DEFAULT NULL COMMENT 'Desktop, Mobile, Tablet',
    `browser` VARCHAR(100) DEFAULT NULL COMMENT 'Browser name and version',
    `os` VARCHAR(100) DEFAULT NULL COMMENT 'Operating system',
    `login_method` VARCHAR(50) DEFAULT NULL COMMENT 'Authentication method used',
    `is_suspicious` BOOLEAN DEFAULT FALSE COMMENT 'Flagged as suspicious activity',
    `failed_attempts` INT DEFAULT 0 COMMENT 'Number of failed login attempts',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_session_user` (`user_id`),
    INDEX `idx_session_ip` (`ip_address`),
    INDEX `idx_session_time` (`login_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `api_keys` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `api_key` VARCHAR(255) NOT NULL UNIQUE,
    `prefix` VARCHAR(10) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `last_used_at` TIMESTAMP DEFAULT NULL,
    `expires_at` TIMESTAMP DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_apikey_user` (`user_id`),
    INDEX `idx_apikey_company` (`company_id`),
    INDEX `idx_apikey_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sso_providers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `client_id` VARCHAR(255) NOT NULL,
    `client_secret` VARCHAR(255) NOT NULL,
    `issuer_url` VARCHAR(255) DEFAULT NULL,
    `authorization_url` VARCHAR(255) DEFAULT NULL,
    `token_url` VARCHAR(255) DEFAULT NULL,
    `userinfo_url` VARCHAR(255) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `company_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sso_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mfa_settings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `is_enabled` BOOLEAN DEFAULT FALSE,
    `secret` VARCHAR(255) DEFAULT NULL,
    `mfa_type` VARCHAR(50) DEFAULT 'TOTP',
    `recovery_codes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_mfa_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
