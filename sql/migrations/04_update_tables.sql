-- Migration 04: Drop old tables and create new normalized tables in English
SET FOREIGN_KEY_CHECKS = 0;

-- Drop old tables if they exist
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS mantenimientos;
DROP TABLE IF EXISTS viajes;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS bicicletas;
DROP TABLE IF EXISTS estaciones;
DROP TABLE IF EXISTS tarjetas_credito;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS planes;

-- Create new tables in English with normalized structure and singular names
CREATE TABLE IF NOT EXISTS plan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    included_rides INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    plan_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plan(id)
);

CREATE TABLE IF NOT EXISTS credit_card (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    brand VARCHAR(50),
    expiration_date DATE,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS station (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL,
    type ENUM('Residential', 'Metro', 'Financial Center') NOT NULL
);

CREATE TABLE IF NOT EXISTS bike (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Mechanical', 'Electric') NOT NULL,
    status ENUM('Available', 'Reserved', 'In Ride', 'Maintenance') NOT NULL,
    battery INT,
    station_id INT,
    FOREIGN KEY (station_id) REFERENCES station(id)
);

CREATE TABLE IF NOT EXISTS reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bike_id INT NOT NULL,
    station_id INT NOT NULL,
    reserved_at DATETIME NOT NULL,
    status ENUM('Active', 'Expired', 'Cancelled') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (bike_id) REFERENCES bike(id),
    FOREIGN KEY (station_id) REFERENCES station(id)
);

CREATE TABLE IF NOT EXISTS ride (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    bike_id INT NOT NULL,
    user_id INT NOT NULL,
    origin_station_id INT NOT NULL,
    destination_station_id INT,
    type ENUM('Last Mile', 'Long Ride') NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration_minutes INT,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id),
    FOREIGN KEY (bike_id) REFERENCES bike(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (origin_station_id) REFERENCES station(id),
    FOREIGN KEY (destination_station_id) REFERENCES station(id)
);

CREATE TABLE IF NOT EXISTS payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ride_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Card', 'Balance', 'CityPass') NOT NULL,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (ride_id) REFERENCES ride(id)
);

CREATE TABLE IF NOT EXISTS maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bike_id INT NOT NULL,
    user_id INT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'In Progress', 'Completed') NOT NULL,
    FOREIGN KEY (bike_id) REFERENCES bike(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

SET FOREIGN_KEY_CHECKS = 1;