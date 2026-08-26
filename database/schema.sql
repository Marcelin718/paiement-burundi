-- =========================================================
-- PayReg Burundi — schéma de base de données
-- Moteur : MySQL / MariaDB
-- =========================================================

CREATE DATABASE IF NOT EXISTS payreg_burundi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payreg_burundi;

CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)     NOT NULL,
  phone           VARCHAR(30)      NOT NULL,
  email           VARCHAR(150)     NOT NULL,
  reference_code  VARCHAR(100)     NOT NULL,
  payment_method  VARCHAR(50)      NOT NULL,
  amount          DECIMAL(14,2)    NOT NULL,
  currency        ENUM('BIF','USD','EUR') NOT NULL DEFAULT 'BIF',
  note            TEXT             NULL,
  status          ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_reference (reference_code),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

