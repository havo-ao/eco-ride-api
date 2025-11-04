USE ecoride_db;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'ride'
    AND column_name = 'status'
);

SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE ride ADD COLUMN status ENUM (''Active'',''Completed'') NOT NULL DEFAULT ''Active'' AFTER duration_minutes',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP PROCEDURE IF EXISTS sp_get_stations_with_availability;

CREATE PROCEDURE sp_get_stations_with_availability ()
BEGIN
  SELECT
    s.id,
    s.name,
    s.type,
    s.capacity,
    COALESCE(
      SUM(
        CASE
          WHEN b.status = 'Available'
           AND b.type = 'Mechanical' THEN 1
          ELSE 0
        END
      ),
      0
    ) AS availableMechanical,
    COALESCE(
      SUM(
        CASE
          WHEN b.status = 'Available'
           AND b.type = 'Electric' THEN 1
          ELSE 0
        END
      ),
      0
    ) AS availableElectric,
    s.latitude,
    s.longitude
  FROM station s
  LEFT JOIN bike b ON b.station_id = s.id
  GROUP BY
    s.id,
    s.name,
    s.type,
    s.capacity,
    s.latitude,
    s.longitude
  ORDER BY
    s.id;
END;

DROP PROCEDURE IF EXISTS sp_get_active_ride;

CREATE PROCEDURE sp_get_active_ride (IN p_user_id INT)
BEGIN
  SELECT
    r.id,
    r.user_id,
    r.bike_id,
    r.origin_station_id,
    os.name AS origin_station_name,
    r.destination_station_id,
    ds.name AS destination_station_name,
    r.start_time,
    r.end_time,
    r.status
  FROM ride r
  JOIN station os ON os.id = r.origin_station_id
  LEFT JOIN station ds ON ds.id = r.destination_station_id
  WHERE r.user_id = p_user_id
    AND r.status = 'Active'
  ORDER BY r.start_time DESC
  LIMIT 1;
END;

DROP PROCEDURE IF EXISTS sp_start_ride;

CREATE PROCEDURE sp_start_ride (
  IN p_user_id INT,
  IN p_reservation_id INT,
  IN p_bike_id INT
)
BEGIN
  DECLARE v_res_user_id INT;
  DECLARE v_res_bike_id INT;
  DECLARE v_res_station_id INT;
  DECLARE v_res_status ENUM('Active','Expired','Cancelled');
  DECLARE v_res_reserved_at DATETIME;
  DECLARE v_now DATETIME;

  SET v_now = NOW();

  SELECT
    user_id,
    bike_id,
    station_id,
    status,
    reserved_at
  INTO
    v_res_user_id,
    v_res_bike_id,
    v_res_station_id,
    v_res_status,
    v_res_reserved_at
  FROM reservation
  WHERE id = p_reservation_id
  LIMIT 1;

  IF v_res_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RESERVATION_NOT_FOUND';
  END IF;

  IF v_res_user_id <> p_user_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RESERVATION_NOT_OWNER';
  END IF;

  IF v_res_status <> 'Active' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RESERVATION_NOT_ACTIVE';
  END IF;

  IF TIMESTAMPDIFF(MINUTE, v_res_reserved_at, v_now) > 10 THEN
    UPDATE reservation
    SET status = 'Expired'
    WHERE id = p_reservation_id;

    UPDATE bike
    SET status = 'Available'
    WHERE id = v_res_bike_id;

    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RESERVATION_EXPIRED';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM ride
    WHERE user_id = p_user_id
      AND status = 'Active'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'ACTIVE_RIDE_EXISTS';
  END IF;

  IF v_res_bike_id <> p_bike_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'BIKE_MISMATCH';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM bike
    WHERE id = p_bike_id
      AND status = 'Reserved'
      AND station_id = v_res_station_id
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'BIKE_NOT_RESERVED_OR_STATION_MISMATCH';
  END IF;

  INSERT INTO ride (
    reservation_id,
    bike_id,
    user_id,
    origin_station_id,
    destination_station_id,
    type,
    start_time,
    end_time,
    duration_minutes,
    status
  )
  VALUES (
    p_reservation_id,
    p_bike_id,
    p_user_id,
    v_res_station_id,
    NULL,
    'Last Mile',
    v_now,
    NULL,
    NULL,
    'Active'
  );

  UPDATE bike
  SET status = 'In Ride'
  WHERE id = p_bike_id;

  UPDATE reservation
  SET status = 'Cancelled'
  WHERE id = p_reservation_id;

  SELECT
    r.id,
    r.user_id,
    r.bike_id,
    r.origin_station_id,
    os.name AS origin_station_name,
    r.destination_station_id,
    ds.name AS destination_station_name,
    r.start_time,
    r.end_time,
    r.status
  FROM ride r
  JOIN station os ON os.id = r.origin_station_id
  LEFT JOIN station ds ON ds.id = r.destination_station_id
  WHERE r.id = LAST_INSERT_ID();
END;

DROP PROCEDURE IF EXISTS sp_end_ride;

CREATE PROCEDURE sp_end_ride (
  IN p_user_id INT,
  IN p_ride_id INT,
  IN p_destination_station_id INT
)
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_bike_id INT;
  DECLARE v_status ENUM('Active','Completed');
  DECLARE v_start_time DATETIME;
  DECLARE v_now DATETIME;
  DECLARE v_duration_minutes INT;

  SET v_now = NOW();

  SELECT
    user_id,
    bike_id,
    status,
    start_time
  INTO
    v_user_id,
    v_bike_id,
    v_status,
    v_start_time
  FROM ride
  WHERE id = p_ride_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RIDE_NOT_FOUND';
  END IF;

  IF v_user_id <> p_user_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RIDE_NOT_OWNER';
  END IF;

  IF v_status <> 'Active' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RIDE_NOT_ACTIVE';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM station
    WHERE id = p_destination_station_id
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DESTINATION_STATION_NOT_FOUND';
  END IF;

  SET v_duration_minutes = TIMESTAMPDIFF(MINUTE, v_start_time, v_now);

  UPDATE ride
  SET
    destination_station_id = p_destination_station_id,
    end_time = v_now,
    duration_minutes = v_duration_minutes,
    status = 'Completed'
  WHERE id = p_ride_id;

  UPDATE bike
  SET
    station_id = p_destination_station_id,
    status = 'Available'
  WHERE id = v_bike_id;

  SELECT
    r.id,
    r.user_id,
    r.bike_id,
    r.origin_station_id,
    os.name AS origin_station_name,
    r.destination_station_id,
    ds.name AS destination_station_name,
    r.start_time,
    r.end_time,
    r.status
  FROM ride r
  JOIN station os ON os.id = r.origin_station_id
  LEFT JOIN station ds ON ds.id = r.destination_station_id
  WHERE r.id = p_ride_id;
END;
