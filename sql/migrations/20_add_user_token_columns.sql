USE ecoride_db;

-- Add columns for storing a hashed verification token and expiration timestamp
-- Add to both `usuarios` and `user` tables if they exist and don't already have the columns

-- For `user` table
SET @sql2 = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'password_reset_token') = 0,
    'ALTER TABLE `user` ADD COLUMN `password_reset_token` VARCHAR(255) NULL, ADD COLUMN `password_reset_expires` DATETIME NULL;',
    'SELECT 1'
  )
);
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
