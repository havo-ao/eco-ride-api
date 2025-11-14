USE ecoride_db;

DROP PROCEDURE IF EXISTS sp_login_user;

CREATE PROCEDURE sp_login_user (IN p_email VARCHAR(190))
BEGIN
  SELECT
    id,
    email,
    password_hash AS passwordHash,
    is_active AS isActive  --  Agregar este campo con alias
  FROM
    user
  WHERE
    email = p_email
  LIMIT 1;
END;