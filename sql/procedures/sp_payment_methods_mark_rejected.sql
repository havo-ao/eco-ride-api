-- sql/procedures/sp_payment_methods_mark_rejected.sql
DROP PROCEDURE IF EXISTS sp_payment_methods_mark_rejected;
DELIMITER $$
CREATE PROCEDURE sp_payment_methods_mark_rejected(
  IN p_user_id BIGINT,
  IN p_reason VARCHAR(500)
)
BEGIN
  /*
    Intenta marcar como 'rejected' el método de pago MÁS RECIENTE del usuario.
    Si el usuario no tiene registros en payment_methods, inserta un placeholder.
  */

  DECLARE v_pm_id BIGINT UNSIGNED DEFAULT NULL;

  -- 1) Buscar el último payment_method del usuario por updated_at (más reciente)
  SELECT pm.id
    INTO v_pm_id
  FROM payment_methods pm
  WHERE pm.user_id = p_user_id
  ORDER BY pm.updated_at DESC, pm.id DESC
  LIMIT 1;

  -- 2) Si existe alguno, actualizar ese registro
  IF v_pm_id IS NOT NULL THEN
    UPDATE payment_methods
       SET status = 'rejected',
           failure_reason = p_reason,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = v_pm_id;
  ELSE
    -- 3) Si no existe ninguno, crear un placeholder rechazado
    INSERT INTO payment_methods (
      user_id,
      stripe_customer_id,
      stripe_payment_method_id,
      status,
      failure_reason
    ) VALUES (
      p_user_id,
      '',
      CONCAT('pm_rejected_', UUID()),
      'rejected',
      p_reason
    );
  END IF;
END$$
DELIMITER ;
