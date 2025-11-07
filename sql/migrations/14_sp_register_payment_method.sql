USE ecoride_db;

DROP PROCEDURE IF EXISTS sp_register_payment_method;
CREATE PROCEDURE sp_register_payment_method(
  IN p_user_id BIGINT,
  IN p_type VARCHAR(20),
  IN p_stripe_payment_method_id VARCHAR(255),
  IN p_brand VARCHAR(50),
  IN p_last4 CHAR(4),
  IN p_exp_month TINYINT,
  IN p_exp_year SMALLINT,
  IN p_is_valid TINYINT,
  IN p_set_as_default TINYINT,
  OUT p_result_code INT,
  OUT p_result_message VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_result_code = -1;
    SET p_result_message = 'ERROR_INTERNAL';
  END;

  START TRANSACTION;

  IF p_is_valid = 0 THEN
    ROLLBACK;
    SET p_result_code = 2;
    SET p_result_message = 'PAYMENT_METHOD_REJECTED';
  ELSE
    -- Si el medio será por defecto, quitar default de otros medios del usuario
    IF p_set_as_default = 1 THEN
      UPDATE payment_methods
      SET is_default = 0
      WHERE user_id = p_user_id AND is_default = 1;
    END IF;

    INSERT INTO payment_methods (
      user_id, type, stripe_payment_method_id, brand, last4, exp_month, exp_year, status, is_default
    ) VALUES (
      p_user_id, p_type, p_stripe_payment_method_id, p_brand, p_last4, p_exp_month, p_exp_year, 'VALID', p_set_as_default
    );

    SET p_result_code = 0;
    SET p_result_message = 'OK';

    COMMIT;
  END IF;

END;
