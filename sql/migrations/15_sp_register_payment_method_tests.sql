USE ecoride_db;

-- Tests para sp_register_payment_method (envolver en TRANSACTION y ROLLBACK al final)
START TRANSACTION;

SET @o_code = NULL;
SET @o_msg = NULL;

-- 1) Caso tarjeta válida
CALL sp_register_payment_method(
  1,
  'CARD',
  'pm_card_valid_123',
  'VISA',
  '4242',
  12,
  2030,
  1,
  1,
  @o_code, @o_msg
);
SELECT 'VALID_CASE' AS test_case, @o_code AS result_code, @o_msg AS result_message;

SELECT id, user_id, type, last4, status, is_default FROM payment_methods WHERE user_id = 1;

-- 2) Caso tarjeta rechazada
SET @o_code = NULL;
SET @o_msg = NULL;
CALL sp_register_payment_method(
  1,
  'CARD',
  'pm_card_rejected_123',
  'VISA',
  '0000',
  1,
  2000,
  0,
  0,
  @o_code, @o_msg
);
SELECT 'REJECTED_CASE' AS test_case, @o_code AS result_code, @o_msg AS result_message;

SELECT id, stripe_payment_method_id, status FROM payment_methods WHERE stripe_payment_method_id IN ('pm_card_valid_123','pm_card_rejected_123');

ROLLBACK;
