USE ecoride_db;

DROP FUNCTION IF EXISTS fn_get_bike_available;

CREATE FUNCTION fn_get_bike_available (p_station_id INT, p_bike_type VARCHAR(20)) RETURNS INT DETERMINISTIC BEGIN DECLARE v_bike_id INT;

SELECT
  id INTO v_bike_id
FROM
  bike
WHERE
  station_id = p_station_id
  AND status = 'Available'
  AND (
    p_bike_type IS NULL
    OR type = p_bike_type
  )
  AND (
    type = 'Mechanical'
    OR battery IS NULL
    OR battery >= 40
  )
ORDER BY
  RAND ()
LIMIT
  1;

RETURN v_bike_id;

END;

DROP PROCEDURE IF EXISTS sp_get_active_reservation;

CREATE PROCEDURE sp_get_active_reservation (IN p_user_id INT) BEGIN DECLARE v_now DATETIME;

SET
  v_now = NOW ();

UPDATE reservation r
JOIN bike b ON r.bike_id = b.id
SET
  r.status = 'Expired',
  b.status = 'Available'
WHERE
  r.status = 'Active'
  AND TIMESTAMPDIFF (MINUTE, r.reserved_at, v_now) >= 10;

SELECT
  r.id,
  r.user_id,
  r.bike_id,
  r.station_id,
  s.name AS stationName,
  b.type AS bikeType,
  r.reserved_at AS reservedAt,
  DATE_ADD (r.reserved_at, INTERVAL 10 MINUTE) AS expiresAt,
  r.status
FROM
  reservation r
  JOIN bike b ON r.bike_id = b.id
  JOIN station s ON r.station_id = s.id
WHERE
  r.user_id = p_user_id
  AND r.status = 'Active'
LIMIT
  1;

END;

DROP PROCEDURE IF EXISTS sp_create_reservation;

CREATE PROCEDURE sp_create_reservation (
  IN p_user_id INT,
  IN p_station_id INT,
  IN p_bike_type VARCHAR(20)
) BEGIN DECLARE v_existing INT;

DECLARE v_bike_id INT;

DECLARE v_now DATETIME;

SET
  v_now = NOW ();

SELECT
  COUNT(*) INTO v_existing
FROM
  reservation
WHERE
  user_id = p_user_id
  AND status = 'Active';

IF v_existing > 0 THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'ACTIVE_RESERVATION_EXISTS';

END IF;

SET
  v_bike_id = fn_get_bike_available (p_station_id, p_bike_type);

IF v_bike_id IS NULL THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'NO_BIKES_AVAILABLE';

END IF;

INSERT INTO
  reservation (user_id, bike_id, station_id, reserved_at, status)
VALUES
  (
    p_user_id,
    v_bike_id,
    p_station_id,
    v_now,
    'Active'
  );

UPDATE bike
SET
  status = 'Reserved'
WHERE
  id = v_bike_id;

SELECT
  r.id,
  r.user_id,
  r.bike_id,
  r.station_id,
  s.name AS stationName,
  b.type AS bikeType,
  r.reserved_at AS reservedAt,
  DATE_ADD (r.reserved_at, INTERVAL 10 MINUTE) AS expiresAt,
  r.status
FROM
  reservation r
  JOIN bike b ON r.bike_id = b.id
  JOIN station s ON r.station_id = s.id
WHERE
  r.id = LAST_INSERT_ID ();

END;

DROP PROCEDURE IF EXISTS sp_cancel_reservation;

CREATE PROCEDURE sp_cancel_reservation (IN p_reservation_id INT, IN p_user_id INT) BEGIN DECLARE v_count INT;

DECLARE v_status VARCHAR(20);

DECLARE v_bike_id INT;

SELECT
  COUNT(*),
  MAX(status),
  MAX(bike_id) INTO v_count,
  v_status,
  v_bike_id
FROM
  reservation
WHERE
  id = p_reservation_id
  AND user_id = p_user_id;

IF v_count = 0 THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'RESERVATION_NOT_FOUND';

END IF;

IF v_status <> 'Active' THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'RESERVATION_NOT_ACTIVE';

END IF;

UPDATE reservation
SET
  status = 'Cancelled'
WHERE
  id = p_reservation_id;

UPDATE bike
SET
  status = 'Available'
WHERE
  id = v_bike_id;

SELECT
  r.id,
  r.user_id,
  r.bike_id,
  r.station_id,
  s.name AS stationName,
  b.type AS bikeType,
  r.reserved_at AS reservedAt,
  DATE_ADD (r.reserved_at, INTERVAL 10 MINUTE) AS expiresAt,
  r.status
FROM
  reservation r
  JOIN bike b ON r.bike_id = b.id
  JOIN station s ON r.station_id = s.id
WHERE
  r.id = p_reservation_id;

END;

DROP PROCEDURE IF EXISTS sp_expire_reservations;

CREATE PROCEDURE sp_expire_reservations () BEGIN
UPDATE reservation r
JOIN bike b ON r.bike_id = b.id
SET
  r.status = 'Expired',
  b.status = 'Available'
WHERE
  r.status = 'Active'
  AND TIMESTAMPDIFF (MINUTE, r.reserved_at, NOW ()) >= 10;

END;

DROP TRIGGER IF EXISTS tr_reservation_status_update;

CREATE TRIGGER tr_reservation_status_update AFTER
UPDATE ON reservation FOR EACH ROW BEGIN IF NEW.status IN ('Cancelled', 'Expired') THEN
UPDATE bike
SET
  status = 'Available'
WHERE
  id = NEW.bike_id;

END IF;

END;

DROP EVENT IF EXISTS ev_expire_reservations;

CREATE EVENT ev_expire_reservations ON SCHEDULE EVERY 1 MINUTE DO CALL sp_expire_reservations ();