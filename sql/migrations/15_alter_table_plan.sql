ALTER TABLE plan 
MODIFY price DECIMAL(10,2) NOT NULL DEFAULT 0,
MODIFY included_rides INT NOT NULL DEFAULT 0;


INSERT INTO plan (name, description, price, included_rides)
VALUES ('Plan Básico', 'Plan gratuito con funciones limitadas', 0, 0);