-- Phase 0.4: Create MySQL database for Hostel ERP
-- Run this once before starting the server (e.g. mysql -u root -p < scripts/create-database.sql)
-- Replace `hostel_erp` with the same value as DATABASE_SERVICE_API_DB in your .env

CREATE DATABASE IF NOT EXISTS `hostel_erp`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
