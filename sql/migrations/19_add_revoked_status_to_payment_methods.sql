USE ecoride_db;

-- Add REVOKED value to payment_methods.status enum so revoke SP can set it
ALTER TABLE payment_methods
  MODIFY COLUMN status ENUM('PENDING','VALID','REJECTED','REVOKED') NOT NULL DEFAULT 'PENDING';
