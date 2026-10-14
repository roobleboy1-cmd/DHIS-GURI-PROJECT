-- ============================================================================
-- GURI DHIS - House Construction Management System
-- PostgreSQL Database Schema
-- Version: 1.0.0
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DROP EXISTING OBJECTS (IDEMPOTENCY)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS project_progress CASCADE;
DROP TABLE IF EXISTS project_workers CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS construction_requests CASCADE;
DROP TABLE IF EXISTS house_designs CASCADE;
DROP TABLE IF EXISTS houses CASCADE;
DROP TABLE IF EXISTS worker_profiles CASCADE;
DROP TABLE IF EXISTS engineer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS project_worker_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS house_status CASCADE;
DROP TYPE IF EXISTS worker_availability CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES
-- ----------------------------------------------------------------------------

-- User roles within the system
CREATE TYPE user_role AS ENUM (
    'admin',
    'engineer',
    'client',
    'worker'
);

-- Worker availability status
CREATE TYPE worker_availability AS ENUM (
    'available',
    'busy',
    'unavailable'
);

-- House listing status
CREATE TYPE house_status AS ENUM (
    'available',
    'sold',
    'reserved'
);

-- Construction request workflow status
CREATE TYPE request_status AS ENUM (
    'pending',
    'reviewed',
    'approved',
    'rejected',
    'cancelled'
);

-- Construction project lifecycle status
CREATE TYPE project_status AS ENUM (
    'planning',
    'in_progress',
    'paused',
    'completed',
    'cancelled'
);

-- Project worker assignment status
CREATE TYPE project_worker_status AS ENUM (
    'active',
    'completed',
    'removed'
);

-- Financial payment processing status
CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);

-- ----------------------------------------------------------------------------
-- 3. UTILITY FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Automatically update updated_at timestamp column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. CORE TABLES
-- ----------------------------------------------------------------------------

-- Table 1: users
-- Core authentication and user profile table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Core identity table storing credentials, personal info, and platform roles.';
COMMENT ON COLUMN users.email IS 'Unique email address used for login and notifications.';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt salted password hash.';
COMMENT ON COLUMN users.role IS 'Platform role: admin, engineer, client, or worker.';

-- Table 2: engineer_profiles
-- Professional profile details for users with role = engineer
CREATE TABLE engineer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specialization VARCHAR(150),
    experience_years INT DEFAULT 0 CHECK (experience_years >= 0),
    bio TEXT,
    company_name VARCHAR(255),
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INT NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE engineer_profiles IS 'Extended qualifications, licenses, and ratings for civil/structural engineers.';
COMMENT ON COLUMN engineer_profiles.is_verified IS 'Whether admin has verified the engineer professional license.';

-- Table 3: worker_profiles
-- Profile and availability details for construction skilled workers
CREATE TABLE worker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    engineer_id INT REFERENCES users(id) ON DELETE SET NULL,
    skill VARCHAR(150),
    experience_years INT DEFAULT 0 CHECK (experience_years >= 0),
    daily_rate DECIMAL(12,2) DEFAULT 0.00 CHECK (daily_rate >= 0),
    availability_status worker_availability NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE worker_profiles IS 'Extended skills, daily rates, and status for tradesmen and construction workers.';
COMMENT ON COLUMN worker_profiles.engineer_id IS 'Supervising engineer or contractor managing this worker (optional).';

-- Table 4: houses
-- House models and properties available for browsing or construction
CREATE TABLE houses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    bedrooms INT DEFAULT 0 CHECK (bedrooms >= 0),
    bathrooms INT DEFAULT 0 CHECK (bathrooms >= 0),
    area_sqm DECIMAL(10,2) CHECK (area_sqm >= 0),
    price DECIMAL(15,2) CHECK (price >= 0),
    image_url TEXT,
    status house_status NOT NULL DEFAULT 'available',
    featured BOOLEAN NOT NULL DEFAULT false,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE houses IS 'House models, architectural templates, and turnkey homes for sale or build.';
COMMENT ON COLUMN houses.featured IS 'Indicates prominent placement on the customer storefront/landing page.';

-- Table 5: house_designs
-- Architectural blueprints, 3D renderings, and detailed plans for houses
CREATE TABLE house_designs (
    id SERIAL PRIMARY KEY,
    house_id INT REFERENCES houses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    design_type VARCHAR(100),
    image_url TEXT,
    file_url TEXT,
    estimated_cost DECIMAL(15,2) CHECK (estimated_cost >= 0),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE house_designs IS 'Architectural blueprints, CAD files, 3D renders, and design specifications.';
COMMENT ON COLUMN house_designs.file_url IS 'Path or secure URL to download the design specification or CAD drawing.';

-- Table 6: construction_requests
-- Inquiries submitted by clients requesting construction or house building
CREATE TABLE construction_requests (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    house_id INT REFERENCES houses(id) ON DELETE SET NULL,
    engineer_id INT REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    budget DECIMAL(15,2) CHECK (budget >= 0),
    location VARCHAR(255),
    status request_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE construction_requests IS 'Client project quotes, initial requests, and customization inquiries.';
COMMENT ON COLUMN construction_requests.admin_notes IS 'Internal review notes recorded by platform administrators.';

-- Table 7: projects
-- Active or completed house construction projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES construction_requests(id) ON DELETE SET NULL,
    engineer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    client_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    budget DECIMAL(15,2) CHECK (budget >= 0),
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    status project_status NOT NULL DEFAULT 'planning',
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE projects IS 'Contracted construction engagements tracked through planning, execution, and handover.';
COMMENT ON COLUMN projects.progress_percentage IS 'Overall progress calculated or updated by the supervising engineer.';

-- Table 8: project_workers
-- Assignment of workers to construction projects
CREATE TABLE project_workers (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMPTZ,
    status project_worker_status NOT NULL DEFAULT 'active',
    CONSTRAINT uq_project_worker UNIQUE(project_id, worker_id)
);

COMMENT ON TABLE project_workers IS 'Assignment matrix mapping workers and trades to specific active projects.';

-- Table 9: project_progress
-- Milestone and progress updates posted during construction
CREATE TABLE project_progress (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    updated_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    progress_percentage INT CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE project_progress IS 'Chronological construction site diary, milestone completion, and photo progress.';

-- Table 10: project_documents
-- Blueprints, permits, contracts, and inspection documents
CREATE TABLE project_documents (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_url TEXT,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE project_documents IS 'Project files including municipal permits, structural blueprints, and receipts.';
COMMENT ON COLUMN project_documents.is_public IS 'If true, visible to clients and team members without restricted permissions.';

-- Table 11: payments
-- Milestone payments, invoices, and deposits for projects
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(100),
    status payment_status NOT NULL DEFAULT 'pending',
    reference_number VARCHAR(100),
    description TEXT,
    gateway_configured BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payments IS 'Client payments, milestone installments, mobile money receipts (EVC Plus, ZAAD, Sahal), and bank wires.';
COMMENT ON COLUMN payments.gateway_configured IS 'Flag indicating whether automatic payment gateway verification was engaged.';

-- Table 12: favorites
-- House models saved/bookmarked by users
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    house_id INT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_house_favorite UNIQUE (user_id, house_id)
);

COMMENT ON TABLE favorites IS 'Saved wishlist items and bookmarked house listings per user.';

-- Table 13: notifications
-- In-app notifications and alerts for users
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    reference_id INT,
    reference_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'System and activity notifications delivered to users.';
COMMENT ON COLUMN notifications.reference_type IS 'Entity type related to the notification (e.g., project, payment, request).';

-- Table 14: reviews
-- Ratings and feedback submitted for completed projects
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_reviewer UNIQUE (project_id, reviewer_id)
);

COMMENT ON TABLE reviews IS 'End-of-project ratings and reviews between clients and lead engineers.';

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS FOR UPDATED_AT COLUMNS
-- ----------------------------------------------------------------------------

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_engineer_profiles_updated_at
    BEFORE UPDATE ON engineer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_worker_profiles_updated_at
    BEFORE UPDATE ON worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_house_designs_updated_at
    BEFORE UPDATE ON house_designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_construction_requests_updated_at
    BEFORE UPDATE ON construction_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ----------------------------------------------------------------------------

-- Indexes on users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Indexes on engineer_profiles
CREATE INDEX idx_engineer_profiles_user_id ON engineer_profiles(user_id);
CREATE INDEX idx_engineer_profiles_specialization ON engineer_profiles(specialization);
CREATE INDEX idx_engineer_profiles_is_verified ON engineer_profiles(is_verified);
CREATE INDEX idx_engineer_profiles_rating ON engineer_profiles(rating DESC);

-- Indexes on worker_profiles
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_engineer_id ON worker_profiles(engineer_id);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(availability_status);
CREATE INDEX idx_worker_profiles_skill ON worker_profiles(skill);

-- Indexes on houses
CREATE INDEX idx_houses_created_by ON houses(created_by);
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_featured ON houses(featured);
CREATE INDEX idx_houses_price ON houses(price);
CREATE INDEX idx_houses_location ON houses(location);

-- Indexes on house_designs
CREATE INDEX idx_house_designs_house_id ON house_designs(house_id);
CREATE INDEX idx_house_designs_created_by ON house_designs(created_by);
CREATE INDEX idx_house_designs_design_type ON house_designs(design_type);

-- Indexes on construction_requests
CREATE INDEX idx_construction_requests_client_id ON construction_requests(client_id);
CREATE INDEX idx_construction_requests_house_id ON construction_requests(house_id);
CREATE INDEX idx_construction_requests_engineer_id ON construction_requests(engineer_id);
CREATE INDEX idx_construction_requests_status ON construction_requests(status);
CREATE INDEX idx_construction_requests_created_at ON construction_requests(created_at DESC);

-- Indexes on projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_engineer_id ON projects(engineer_id);
CREATE INDEX idx_projects_request_id ON projects(request_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_estimated_end_date ON projects(estimated_end_date);

-- Indexes on project_workers
CREATE INDEX idx_project_workers_project_id ON project_workers(project_id);
CREATE INDEX idx_project_workers_worker_id ON project_workers(worker_id);
CREATE INDEX idx_project_workers_status ON project_workers(status);

-- Indexes on project_progress
CREATE INDEX idx_project_progress_project_id ON project_progress(project_id);
CREATE INDEX idx_project_progress_updated_by ON project_progress(updated_by);
CREATE INDEX idx_project_progress_created_at ON project_progress(created_at DESC);

-- Indexes on project_documents
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by);
CREATE INDEX idx_project_documents_doc_type ON project_documents(document_type);
CREATE INDEX idx_project_documents_is_public ON project_documents(is_public);

-- Indexes on payments
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference_number ON payments(reference_number);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- Indexes on favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_house_id ON favorites(house_id);

-- Indexes on notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(user_id, is_read, created_at DESC);

-- Indexes on reviews
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ----------------------------------------------------------------------------
-- 7. DEFAULT ADMIN USER (SCHEMA TEMPLATE)
-- ----------------------------------------------------------------------------
-- To initialize the admin account with a working bcrypt hash, run seed.sql.
-- Below is a commented SQL template for manual provisioning:
--
-- INSERT INTO users (
--     email,
--     password_hash,
--     full_name,
--     phone,
--     role,
--     is_active
-- ) VALUES (
--     'admin@guridhis.com',
--     '$2b$10$YourHashedBcryptPasswordHere...', -- Replace with real bcrypt hash
--     'System Administrator',
--     '+252 61 5000000',
--     'admin',
--     true
-- ) ON CONFLICT (email) DO NOTHING;
-- ============================================================================
