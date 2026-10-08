-- ============================================================================
-- HRMS Seed Data
-- Test data for development and initial system setup
--
-- Creates test users:
--   1. admin / admin (Admin role) - Full system access
--   2. hr / hr (HR role) - Human resources operations
--   3. employee / employee (Employee role) - Standard employee access
--
-- Passwords are BCrypt hashed (12 rounds)
-- Leave balances are auto-initialized for the current year
-- ============================================================================
-- ============================================================================
-- TEST EMPLOYEES
-- Admin, HR manager, and Employee accounts for initial system access
-- ============================================================================
INSERT INTO
  employees (
    first_name,
    last_name,
    ic_passport_number,
    email,
    phone,
    department,
    position,
    hire_date,
    status
  )
VALUES
  (
    'Admin',
    'Test',
    'IC-00-0001',
    'admin.test@example.com',
    '+60000000001',
    'Admin',
    'Admin Manager',
    CURRENT_DATE,
    'active'
  ),
  (
    'HR',
    'Test',
    'IC-00-0002',
    'hr.test@example.com',
    '+60000000002',
    'Human Resources',
    'HR Manager',
    CURRENT_DATE,
    'active'
  ),
  (
    'Employee',
    'Test',
    'IC-00-0003',
    'employee.test@example.com',
    '+60000000003',
    'Testing',
    'Tester',
    CURRENT_DATE,
    'active'
  );

-- ============================================================================
-- USER ACCOUNTS
-- Authentication credentials linked to employees
-- ============================================================================
INSERT INTO
  users (employee_id, username, password_hash, role)
SELECT
  e.id,
  'admin',
  '$2a$12$RWcIvd/z7G0x4k2lki9RJ.sYMCKzZTWFduwlUX4Hzj/mdlYo5sU92', -- Password: admin -> BCrypt hash (12 rounds)
  'admin'
FROM
  employees e
WHERE
  e.email = 'admin.test@example.com';

INSERT INTO
  users (employee_id, username, password_hash, role)
SELECT
  e.id,
  'hr',
  '$2a$12$OL/.7vUq1dXVpcVShHI79uULCS9.KdwtlJcDahmJSN6.kMUmHc1ri', -- Password: hr -> BCrypt hash (12 rounds)
  'hr'
FROM
  employees e
WHERE
  e.email = 'hr.test@example.com';

INSERT INTO
  users (employee_id, username, password_hash, role)
SELECT
  e.id,
  'employee',
  '$2a$12$sw9pkUK4WThWaBUTI8sRjOLPiHR7MsABG/36N48Qzb7q5FSx0mSFy', -- Password: employee -> BCrypt hash (12 rounds)
  'employee'
FROM
  employees e
WHERE
  e.email = 'employee.test@example.com';

-- ============================================================================
-- INITIAL LEAVE BALANCES
-- Initializes all leave types for test users with full annual entitlement
-- Cross-join assigns all leave types to all test users
-- ============================================================================
INSERT INTO
  leave_balance (
    employee_id,
    leave_type_id,
    year,
    total_days,
    used_days
  )
SELECT
  e.id,
  lt.id,
  EXTRACT(
    YEAR
    FROM
      CURRENT_DATE
  )::INTEGER,
  lt.days_per_year,
  0
FROM
  employees e
  CROSS JOIN leave_types lt
WHERE
  e.email IN (
    'admin.test@example.com',
    'hr.test@example.com',
    'employee.test@example.com'
  );
