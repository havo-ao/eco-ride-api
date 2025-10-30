DELIMITER $$

CREATE PROCEDURE sp_register_user (
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(255),
    OUT p_status VARCHAR(10),
    OUT p_message VARCHAR(255),
    OUT p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Error al registrar usuario';
        SET p_user_id = NULL;
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'El correo ya está registrado';
        SET p_user_id = NULL;
    ELSE
        INSERT INTO usuarios (email, password_hash, full_name, created_at)
        VALUES (p_email, p_password_hash, p_full_name, NOW());

        SET p_user_id = LAST_INSERT_ID();
        SET p_status = 'OK';
        SET p_message = 'Usuario registrado exitosamente';
        COMMIT;
    END IF;
END$$

DELIMITER ;