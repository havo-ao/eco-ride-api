USE ecoride_db;

-- DDL: tabla payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type ENUM('CARD','WALLET') NOT NULL,
  stripe_payment_method_id VARCHAR(255) NULL,
  brand VARCHAR(50) NULL,
  last4 CHAR(4) NULL,
  exp_month TINYINT NULL,
  exp_year SMALLINT NULL,
  status ENUM('PENDING','VALID','REJECTED') NOT NULL DEFAULT 'PENDING',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status),
  UNIQUE KEY uq_user_stripe_pm (user_id, stripe_payment_method_id)
);

-- Nota: La restricción de único is_default por usuario se maneja desde el SP (o trigger si se desea).
