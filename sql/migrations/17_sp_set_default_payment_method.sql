DROP PROCEDURE IF EXISTS sp_set_default_payment_method;

CREATE PROCEDURE sp_set_default_payment_method(
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

  -- Ensure the payment method belongs to the user
  IF (SELECT COUNT(*) FROM payment_methods WHERE id = p_payment_method_id AND user_id = p_user_id) = 0 THEN
    SET o_result_code = 2;
    SET o_result_message = 'NOT_OWNED';
    ROLLBACK;
  ELSE
    -- Set all user's methods to not default
    UPDATE payment_methods SET is_default = 0 WHERE user_id = p_user_id;

    -- Set the requested one as default
    UPDATE payment_methods SET is_default = 1 WHERE id = p_payment_method_id AND user_id = p_user_id;

    COMMIT;
    SET o_result_code = 0;
    SET o_result_message = 'OK';
  END IF;
END;
