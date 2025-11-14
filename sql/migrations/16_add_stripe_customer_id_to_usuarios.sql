-- Add stripe_customer_id to either `usuarios` or `user` if present and missing the column.
-- Use prepared statements + information_schema checks instead of DELIMITER/procedure so this file
-- can be executed by simple migration runners against MySQL/MariaDB.

-- For `usuarios` table
SELECT COUNT(*) INTO @has_usuarios FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'usuarios';
SELECT COUNT(*) INTO @has_col_usuarios FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'stripe_customer_id';
SET @stmt = IF(@has_usuarios = 1 AND @has_col_usuarios = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `stripe_customer_id` VARCHAR(255) NULL',
  'SELECT 0');
PREPARE add_col FROM @stmt;
EXECUTE add_col;
DEALLOCATE PREPARE add_col;

-- For `user` table
SELECT COUNT(*) INTO @has_user FROM information_schema.tables
  WHERE table_schema = DATABASE() AND table_name = 'user';
SELECT COUNT(*) INTO @has_col_user FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'stripe_customer_id';
SET @stmt = IF(@has_user = 1 AND @has_col_user = 0,
  'ALTER TABLE `user` ADD COLUMN `stripe_customer_id` VARCHAR(255) NULL',
  'SELECT 0');
PREPARE add_col2 FROM @stmt;
EXECUTE add_col2;
DEALLOCATE PREPARE add_col2;

-- Note: we intentionally avoid index creation here to keep the migration simple and portable.
-- If you want an index, add it in a follow-up migration using a similar guarded pattern.
