USE ecoride_db;

DROP PROCEDURE IF EXISTS sp_login_user;

CREATE PROCEDURE sp_login_user (
  IN p_email VARCHAR(190),
  IN p_password VARCHAR(255)
) BEGIN DECLARE v_user_id BIGINT;

DECLARE v_salt VARBINARY(16);

DECLARE v_stored_hash VARBINARY(64);

DECLARE v_calc_hash VARBINARY(64);

SELECT
  id,
  password_salt,
  password_hash INTO v_user_id,
  v_salt,
  v_stored_hash
FROM
  user
WHERE
  email = p_email
LIMIT
  1;

IF v_user_id IS NULL THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'INVALID_CREDENTIALS';

END IF;

SET
  v_calc_hash = UNHEX (SHA2 (CONCAT (p_password, HEX (v_salt)), 256));

IF v_calc_hash <> v_stored_hash THEN SIGNAL SQLSTATE '45000'
SET
  MESSAGE_TEXT = 'INVALID_CREDENTIALS';

END IF;

SELECT
  id,
  email
FROM
  user
WHERE
  id = v_user_id;

END;