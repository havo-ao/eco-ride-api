USE ecoride_db;

-- Estación 1: Calle 45
INSERT INTO
  station (name, location, capacity, latitude, longitude)
SELECT
  *
FROM
  (
    SELECT
      'Estación Calle 45' AS name,
      'Calle 45 con Caracas' AS location,
      20 AS capacity,
      4.638000 AS latitude,
      -74.085000 AS longitude
  ) AS tmp
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      station
    WHERE
      name = 'Estación Calle 45'
  );

-- Estación 2: Parque de la 93
INSERT INTO
  station (name, location, capacity, latitude, longitude)
SELECT
  *
FROM
  (
    SELECT
      'Parque de la 93' AS name,
      'Parque de la 93' AS location,
      15 AS capacity,
      4.676000 AS latitude,
      -74.048000 AS longitude
  ) AS tmp
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      station
    WHERE
      name = 'Parque de la 93'
  );

-- Estación 3: Zona T
INSERT INTO
  station (name, location, capacity, latitude, longitude)
SELECT
  *
FROM
  (
    SELECT
      'Zona T' AS name,
      'Zona Rosa / Zona T' AS location,
      18 AS capacity,
      4.666000 AS latitude,
      -74.054000 AS longitude
  ) AS tmp
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      station
    WHERE
      name = 'Zona T'
  );

-- Bicis para Estación Calle 45
INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Mechanical',
  NULL,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Mechanical'
WHERE
  s.name = 'Estación Calle 45'
  AND b.id IS NULL
LIMIT
  10;

INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Electric',
  80,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Electric'
WHERE
  s.name = 'Estación Calle 45'
  AND b.id IS NULL
LIMIT
  5;

-- Bicis para Parque de la 93
INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Mechanical',
  NULL,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Mechanical'
WHERE
  s.name = 'Parque de la 93'
  AND b.id IS NULL
LIMIT
  8;

INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Electric',
  70,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Electric'
WHERE
  s.name = 'Parque de la 93'
  AND b.id IS NULL
LIMIT
  4;

-- Bicis para Zona T
INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Mechanical',
  NULL,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Mechanical'
WHERE
  s.name = 'Zona T'
  AND b.id IS NULL
LIMIT
  6;

INSERT INTO
  bike (station_id, type, battery, status)
SELECT
  s.id,
  'Electric',
  90,
  'Available'
FROM
  station s
  LEFT JOIN bike b ON b.station_id = s.id
  AND b.type = 'Electric'
WHERE
  s.name = 'Zona T'
  AND b.id IS NULL
LIMIT
  3;