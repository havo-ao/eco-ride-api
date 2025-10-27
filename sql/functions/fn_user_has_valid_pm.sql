-- sql/functions/fn_user_has_valid_pm.sql
DROP FUNCTION IF EXISTS fn_user_has_valid_pm;
DELIMITER $$
CREATE FUNCTION fn_user_has_valid_pm(p_user_id BIGINT)
RETURNS TINYINT(1)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_count
  FROM payment_methods
  WHERE user_id = p_user_id
    AND status = 'valid';

  RETURN IF(v_count > 0, 1, 0);
END$$
DELIMITER ;
