-- sql/procedures/sp_payment_methods_upsert_valid.sql
DROP PROCEDURE IF EXISTS sp_payment_methods_upsert_valid;
DELIMITER $$
CREATE PROCEDURE sp_payment_methods_upsert_valid(
  IN p_user_id BIGINT,
  IN p_stripe_customer_id VARCHAR(255),
  IN p_stripe_payment_method_id VARCHAR(255)
)
BEGIN
  /*
    Marca (o crea) un método de pago como 'valid' para el usuario.
    Requiere un índice único en (user_id, stripe_payment_method_id).
  */
  INSERT INTO payment_methods (
    user_id,
    stripe_customer_id,
    stripe_payment_method_id,
    status,
    failure_reason
  ) VALUES (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_payment_method_id,
    'valid',
    NULL
  )
  ON DUPLICATE KEY UPDATE
    status = 'valid',
    failure_reason = NULL,
    updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
