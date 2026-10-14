-- ============================================================================
-- GURI DHIS - House Construction Management System
-- Database Seed Script
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTE:
-- This seed script provisions only the initial root Administrator account.
-- All other system users (Civil Engineers, Clients, and Skilled Workers)
-- must be registered through the application interface or invited by
-- the administrator to ensure appropriate validation, profile linkage,
-- and security compliance.
-- ============================================================================

-- Seed Default Administrator
-- Default Credentials:
--   Email:    admin@guridhis.com
--   Password: Admin@123
--   Role:     admin
INSERT INTO users (
    email,
    password_hash,
    full_name,
    phone,
    role,
    avatar_url,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@guridhis.com',
    '$2a$10$NsnFAPZezrVRvMaTuS0XzesbRf4TWf3ReVfsnVgE1ejJFT.93zQPK', -- Bcrypt hash for: Admin@123
    'Guri Dhis System Administrator',
    '+252 61 5000000',
    'admin',
    NULL,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- Verification Notice
DO $$
BEGIN
    RAISE NOTICE 'GURI DHIS initial admin user seeded successfully (admin@guridhis.com).';
    RAISE NOTICE 'All other accounts (Engineers, Clients, Workers) should be created via the registration portal.';
END $$;
