DROP PROCEDURE IF EXISTS sp_add_points;

CREATE PROCEDURE sp_add_points(
    IN p_user_id INT,
    IN p_points INT,
    IN p_description VARCHAR(255)
)
BEGIN
    INSERT INTO loyalty_points (user_id, points, description)
    VALUES (p_user_id, p_points, p_description);
END;

DROP PROCEDURE IF EXISTS sp_redeem_points;

CREATE PROCEDURE sp_redeem_points(
    IN p_user_id INT,
    IN p_points INT
)
BEGIN
    DECLARE current_balance INT DEFAULT 0;

    SELECT COALESCE(SUM(points), 0)
    INTO current_balance
    FROM loyalty_points
    WHERE user_id = p_user_id;

    IF current_balance < p_points THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient points';
    END IF;

    INSERT INTO loyalty_points (user_id, points, description)
    VALUES (p_user_id, -p_points, 'Redeem points');

    SELECT current_balance - p_points AS balance;
END;

DROP PROCEDURE IF EXISTS sp_get_loyalty_history;

CREATE PROCEDURE sp_get_loyalty_history(
    IN p_user_id INT
)
BEGIN
    SELECT id, user_id, points, description, created_at
    FROM loyalty_points
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
END;


DROP PROCEDURE IF EXISTS sp_get_loyalty_balance;

CREATE PROCEDURE sp_get_loyalty_balance(
    IN p_user_id INT
)
BEGIN
    SELECT COALESCE(SUM(points), 0) AS balance
    FROM loyalty_points
    WHERE user_id = p_user_id;
END;

