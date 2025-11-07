-- Stored procedures to revoke (detach) payment methods
-- 1) sp_revoke_payment_method: revoke by user id and payment method id
-- 2) sp_revoke_payment_method_by_stripe_id: revoke by stripe payment method id

DROP PROCEDURE IF EXISTS sp_revoke_payment_method;
CREATE PROCEDURE sp_revoke_payment_method(
  IN p_user_id INT,
  IN p_payment_method_id INT,
  OUT o_result_code INT,
  OUT o_result_message VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET o_result_code = 99;
    SET o_result_message = 'DB_ERROR';
  END;

  START TRANSACTION;

  IF (SELECT COUNT(*) FROM payment_methods WHERE id = p_payment_method_id AND user_id = p_user_id) = 0 THEN
    SET o_result_code = 2;
    SET o_result_message = 'NOT_OWNED';
    ROLLBACK;
  ELSE
    UPDATE payment_methods SET status = 'REVOKED', is_default = 0 WHERE id = p_payment_method_id AND user_id = p_user_id;
    COMMIT;
    SET o_result_code = 0;
    SET o_result_message = 'OK';
  END IF;
END;

DROP PROCEDURE IF EXISTS sp_revoke_payment_method_by_stripe_id;
CREATE PROCEDURE sp_revoke_payment_method_by_stripe_id(
  IN p_stripe_pm_id VARCHAR(255),
  OUT o_result_code INT,
  OUT o_result_message VARCHAR(255)
)
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_id INT DEFAULT NULL;

  SELECT COUNT(*) INTO v_count FROM payment_methods WHERE stripe_payment_method_id = p_stripe_pm_id;
  IF v_count = 0 THEN
    SET o_result_code = 1;
    SET o_result_message = 'NOT_FOUND';
  ELSE
    SELECT id INTO v_id FROM payment_methods WHERE stripe_payment_method_id = p_stripe_pm_id LIMIT 1;
    START TRANSACTION;
    UPDATE payment_methods SET status = 'REVOKED', is_default = 0 WHERE id = v_id;
    COMMIT;
    SET o_result_code = 0;
    SET o_result_message = 'OK';
  END IF;
END;
