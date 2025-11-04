USE ecoride_db;

DROP FUNCTION IF EXISTS fn_distance_meters;

CREATE FUNCTION fn_distance_meters (
  p_lat DECIMAL(10, 6),
  p_lng DECIMAL(10, 6),
  p_station_lat DECIMAL(10, 6),
  p_station_lng DECIMAL(10, 6)
) RETURNS INT DETERMINISTIC BEGIN DECLARE rlat1 DOUBLE;

DECLARE rlng1 DOUBLE;

DECLARE rlat2 DOUBLE;

DECLARE rlng2 DOUBLE;

DECLARE dlat DOUBLE;

DECLARE dlng DOUBLE;

DECLARE a DOUBLE;

DECLARE c DOUBLE;

DECLARE d DOUBLE;

IF p_station_lat IS NULL
OR p_station_lng IS NULL THEN RETURN NULL;

END IF;

SET
  rlat1 = RADIANS (p_lat);

SET
  rlng1 = RADIANS (p_lng);

SET
  rlat2 = RADIANS (p_station_lat);

SET
  rlng2 = RADIANS (p_station_lng);

SET
  dlat = rlat2 - rlat1;

SET
  dlng = rlng2 - rlng1;

SET
  a = SIN(dlat / 2) * SIN(dlat / 2) + COS(rlat1) * COS(rlat2) * SIN(dlng / 2) * SIN(dlng / 2);

SET
  c = 2 * ATAN2 (SQRT(a), SQRT(1 - a));

SET
  d = 6371000 * c;

RETURN ROUND(d);

END;

DROP PROCEDURE IF EXISTS sp_get_nearest_station;

CREATE PROCEDURE sp_get_nearest_station (IN p_lat DECIMAL(10, 6), IN p_lng DECIMAL(10, 6)) BEGIN
SELECT
  s.id,
  s.name,
  s.type,
  s.capacity,
  s.latitude,
  s.longitude,
  fn_distance_meters (p_lat, p_lng, s.latitude, s.longitude) AS distanceMeters,
  (
    SELECT
      COUNT(*)
    FROM
      bike b
    WHERE
      b.station_id = s.id
      AND b.status = 'Available'
      AND b.type = 'Mechanical'
  ) AS availableMechanical,
  (
    SELECT
      COUNT(*)
    FROM
      bike b
    WHERE
      b.station_id = s.id
      AND b.status = 'Available'
      AND b.type = 'Electric'
      AND (
        b.battery IS NULL
        OR b.battery >= 40
      )
  ) AS availableElectric
FROM
  station s
WHERE
  s.latitude IS NOT NULL
  AND s.longitude IS NOT NULL
ORDER BY
  distanceMeters ASC
LIMIT
  1;

END;