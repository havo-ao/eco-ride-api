DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_register_user (
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    OUT p_status VARCHAR(10),
    OUT p_message VARCHAR(255),
    OUT p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Error registering user';
        SET p_user_id = NULL;
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM user WHERE email = p_email) THEN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Email already registered';
        SET p_user_id = NULL;
    ELSE
        INSERT INTO user (email, password_hash, first_name, last_name, created_at)
        VALUES (p_email, p_password_hash, p_first_name, p_last_name, NOW());

        SET p_user_id = LAST_INSERT_ID();
        SET p_status = 'OK';
        SET p_message = 'User registered successfully';
        COMMIT;
    END IF;
END$$

DELIMITER ;