USE ecoride_db;
 
ALTER TABLE station
ADD COLUMN latitude DECIMAL(10, 6) NULL AFTER location;
 
ALTER TABLE station
ADD COLUMN longitude DECIMAL(10, 6) NULL AFTER latitude;