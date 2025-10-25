-- PostgreSQL initialization script for YSH B2B
-- Database is automatically created by the POSTGRES_DB environment variable

-- Set timezone
SET timezone
= 'UTC';

-- Enable required extensions
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "citext";

-- Create basic indexes for performance
-- (Medusa will create the complete schema)