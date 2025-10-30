-- Desactiva temporalmente las comprobaciones de claves foráneas solo si es necesario
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    viajes_incluidos INT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    plan_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);

CREATE TABLE IF NOT EXISTS tarjetas_credito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    numero_tarjeta VARCHAR(20) NOT NULL,
    franquicia VARCHAR(50),
    fecha_expiracion DATE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS estaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    capacidad INT NOT NULL,
    tipo ENUM('Residencial', 'Metro', 'Centro Financiero') NOT NULL
);

CREATE TABLE IF NOT EXISTS bicicletas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('Mecanica', 'Electrica') NOT NULL,
    estado ENUM('Disponible', 'Reservada', 'En viaje', 'Mantenimiento') NOT NULL,
    bateria INT,
    estacion_id INT,
    FOREIGN KEY (estacion_id) REFERENCES estaciones(id)
);

CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    bicicleta_id INT NOT NULL,
    estacion_id INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    estado ENUM('Activa', 'Expirada', 'Cancelada') NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (bicicleta_id) REFERENCES bicicletas(id),
    FOREIGN KEY (estacion_id) REFERENCES estaciones(id)
);

CREATE TABLE IF NOT EXISTS viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT NOT NULL,
    bicicleta_id INT NOT NULL,
    usuario_id INT NOT NULL,
    estacion_origen_id INT NOT NULL,
    estacion_destino_id INT,
    tipo ENUM('Ultima Milla', 'Recorrido Largo') NOT NULL,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    duracion_minutos INT,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    FOREIGN KEY (bicicleta_id) REFERENCES bicicletas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (estacion_origen_id) REFERENCES estaciones(id),
    FOREIGN KEY (estacion_destino_id) REFERENCES estaciones(id)
);

CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    viaje_id INT,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Tarjeta', 'Saldo', 'CityPass') NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id)
);

CREATE TABLE IF NOT EXISTS mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bicicleta_id INT NOT NULL,
    usuario_id INT,
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'En Proceso', 'Completado') NOT NULL,
    FOREIGN KEY (bicicleta_id) REFERENCES bicicletas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

SET FOREIGN_KEY_CHECKS = 1;