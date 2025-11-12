DROP PROCEDURE IF EXISTS sp_register_user;

CREATE PROCEDURE sp_register_user (
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_verification_token VARCHAR(64),
    IN p_token_expiration DATETIME,
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

    IF EXISTS (SELECT 1 FROM `user` WHERE email = p_email) THEN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'El correo ya está registrado';
        SET p_user_id = NULL;
    ELSE
        INSERT INTO `user` (
            email,
            password_hash,
            first_name,
            last_name,
            plan_id,
            verification_token,
            token_expiration,
            is_active,
            created_at
        )
        VALUES (
            p_email,
            p_password_hash,
            p_first_name,
            p_last_name,
            1, -- plan por defecto
            p_verification_token,
            p_token_expiration,
            FALSE,
            NOW()
        );

        SET p_user_id = LAST_INSERT_ID();
        SET p_status = 'OK';
        SET p_message = 'Usuario registrado exitosamente';
        COMMIT;
    END IF;
END;