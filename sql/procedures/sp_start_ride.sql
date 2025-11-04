CREATE PROCEDURE sp_start_ride (
    IN p_user_id INT,
    IN p_bike_id INT,
    IN p_origin_station_id INT,
    IN p_type ENUM('Last Mile', 'Long Ride'),
    OUT p_status VARCHAR(10),
    OUT p_message VARCHAR(255),
    OUT p_ride_id INT
)
BEGIN
    DECLARE v_reservation_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Error starting ride';
        SET p_ride_id = NULL;
    END;

    START TRANSACTION;

    SELECT id INTO v_reservation_id
    FROM reservation
    WHERE user_id = p_user_id
      AND bike_id = p_bike_id
      AND status = 'Active'
    LIMIT 1;

    IF v_reservation_id IS NULL THEN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'No active reservation found';
        SET p_ride_id = NULL;
    ELSE
        INSERT INTO ride (
            reservation_id,
            bike_id,
            user_id,
            origin_station_id,
            type,
            start_time
        ) VALUES (
            v_reservation_id,
            p_bike_id,
            p_user_id,
            p_origin_station_id,
            p_type,
            NOW()
        );

        SET p_ride_id = LAST_INSERT_ID();

        UPDATE bike SET status = 'In Ride' WHERE id = p_bike_id;
        UPDATE reservation SET status = 'Expired' WHERE id = v_reservation_id;

        SET p_status = 'OK';
        SET p_message = 'Ride started successfully';
        COMMIT;
    END IF;
END;