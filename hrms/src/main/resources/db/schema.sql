-- ============================================================================
-- HRMS Database Schema
-- PostgreSQL database schema for the BHEL Human Resource Management System
--
-- Tables:
--   employees          - Core employee information (name, contact, department)
--   users              - Authentication credentials and roles (admin, hr, employee)
--   family_details     - Employee family member information
--   leave_types        - Leave categories (Annual, Sick, Emergency, Maternity, Paternity)
--   leave_balance      - Leave quota tracking by employee, year, and type
--   leave_applications - Leave requests and approval workflow
--   audit_log          - Change tracking for compliance and auditing
--
-- Features:
--   - Auto-updating timestamps via trigger
--   - Computed remaining_days column in leave_balance
--   - Cascading deletes for referential integrity
--   - Check constraints for data validation
--   - Indexes for query performance
-- ============================================================================
-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;

DROP TABLE IF EXISTS leave_applications CASCADE;

DROP TABLE IF EXISTS leave_balance CASCADE;

DROP TABLE IF EXISTS leave_types CASCADE;

DROP TABLE IF EXISTS family_details CASCADE;

DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS employees CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column () CASCADE;

-- ============================================================================
-- EMPLOYEES TABLE
-- Core employee information including personal details and employment status
-- ============================================================================
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  ic_passport_number VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'terminated', 'on_leave')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees (email);

CREATE INDEX idx_employees_status ON employees (status);

CREATE INDEX idx_employees_department ON employees (department);

COMMENT ON TABLE employees IS 'Core employee information including personal details and employment status';

COMMENT ON COLUMN employees.ic_passport_number IS 'Unique identification number (IC or Passport)';

COMMENT ON COLUMN employees.status IS 'Employee status: active, inactive, terminated, on_leave';

-- ============================================================================
-- USERS TABLE
-- Authentication and authorization (linked 1:1 with employees)
-- ============================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'hr')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_users_username ON users (username);

CREATE INDEX idx_users_role ON users (role);

COMMENT ON TABLE users IS 'User authentication and authorization information';

COMMENT ON COLUMN users.role IS 'User role: admin, employee, hr';

-- ============================================================================
-- FAMILY_DETAILS TABLE
-- Employee dependents and emergency contacts
-- ============================================================================
CREATE TABLE family_details (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL CHECK (
    relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')
  ),
  date_of_birth DATE,
  contact_number VARCHAR(20),
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_family_employee_id ON family_details (employee_id);

COMMENT ON TABLE family_details IS 'Family member information for each employee';

COMMENT ON COLUMN family_details.relationship IS 'Relationship type: spouse, child, parent, sibling, other';

-- ============================================================================
-- LEAVE_TYPES TABLE
-- Available leave categories with annual entitlements
-- ============================================================================
CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  days_per_year INTEGER NOT NULL CHECK (days_per_year >= 0),
  carry_forward_allowed BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE leave_types IS 'Types of leave available (Annual, Sick, Emergency, etc.)';

COMMENT ON COLUMN leave_types.carry_forward_allowed IS 'Whether unused days can be carried forward to next year';

-- ============================================================================
-- LEAVE_BALANCE TABLE
-- Tracks leave quota per employee, per year, per leave type
-- remaining_days is a computed column (total_days - used_days)
-- ============================================================================
CREATE TABLE leave_balance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  leave_type_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_days DECIMAL(5, 2) NOT NULL DEFAULT 0,
  used_days DECIMAL(5, 2) NOT NULL DEFAULT 0,
  remaining_days DECIMAL(5, 2) GENERATED ALWAYS AS (total_days - used_days) STORED,
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types (id) ON DELETE CASCADE,
  UNIQUE (employee_id, leave_type_id, year),
  CHECK (used_days <= total_days)
);

CREATE INDEX idx_leave_balance_employee ON leave_balance (employee_id);

CREATE INDEX idx_leave_balance_year ON leave_balance (year);

COMMENT ON TABLE leave_balance IS 'Leave balance tracking for each employee by year and leave type';

COMMENT ON COLUMN leave_balance.remaining_days IS 'Computed column: total_days - used_days';

-- ============================================================================
-- LEAVE_APPLICATIONS TABLE
-- Leave requests with approval workflow (pending -> approved/rejected/cancelled)
-- ============================================================================
CREATE TABLE leave_applications (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  leave_type_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5, 2) NOT NULL CHECK (total_days > 0),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled')
  ),
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INTEGER,
  approved_date TIMESTAMP,
  hr_comments TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types (id),
  FOREIGN KEY (approved_by) REFERENCES employees (id),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_app_employee ON leave_applications (employee_id);

CREATE INDEX idx_leave_app_status ON leave_applications (status);

CREATE INDEX idx_leave_app_dates ON leave_applications (start_date, end_date);

COMMENT ON TABLE leave_applications IS 'Leave application requests and approval workflow';

COMMENT ON COLUMN leave_applications.status IS 'Application status: pending, approved, rejected, cancelled';

-- ============================================================================
-- AUDIT_LOG TABLE
-- Tracks all INSERT, UPDATE, DELETE operations for compliance
-- ============================================================================
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_value JSONB,
  new_value JSONB,
  changed_by INTEGER NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES employees (id)
);

CREATE INDEX idx_audit_table_name ON audit_log (table_name);

CREATE INDEX idx_audit_changed_at ON audit_log (changed_at DESC);

COMMENT ON TABLE audit_log IS 'Audit trail for tracking all data changes in the system';

COMMENT ON COLUMN audit_log.action IS 'Type of action: INSERT, UPDATE, DELETE';

-- ============================================================================
-- TRIGGER FUNCTION: update_updated_at_column
-- Automatically sets updated_at to current timestamp on row update
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column () IS 'Automatically updates the updated_at column on row update';

-- Attach trigger to employees table
CREATE TRIGGER update_employees_updated_at BEFORE
UPDATE ON employees FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

-- ============================================================================
-- SEED DATA: Leave Types
-- Default leave categories with standard entitlements
-- ============================================================================
INSERT INTO
  leave_types (
    name,
    days_per_year,
    carry_forward_allowed,
    description
  )
VALUES
  (
    'Annual Leave',
    14,
    true,
    'Standard annual leave entitlement'
  ),
  (
    'Sick Leave',
    14,
    false,
    'Medical leave for illness or medical appointments'
  ),
  (
    'Emergency Leave',
    3,
    false,
    'Emergency situations requiring immediate attention'
  ),
  (
    'Maternity Leave',
    90,
    false,
    'Maternity leave for female employees'
  ),
  (
    'Paternity Leave',
    7,
    false,
    'Paternity leave for male employees'
  );
