GRANT ALL PRIVILEGES ON logistics.* TO 'appuser'@'%';

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  document_type ENUM('CC','CE','PASSPORT') NOT NULL,
  document VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS fares (
  id CHAR(36) PRIMARY KEY,
  type ENUM('DISTANCE','WEIGHT') NOT NULL,
  from_value INT NOT NULL,
  to_value INT DEFAULT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
  id                  CHAR(36)      PRIMARY KEY,
  user_id             CHAR(36)      NOT NULL,
  origin_id           CHAR(36)      NOT NULL,
  destination_id      CHAR(36)      NOT NULL,
  parcel_weight       DECIMAL(10,2) NOT NULL,
  parcel_length       DECIMAL(10,2) NOT NULL,
  parcel_width        DECIMAL(10,2) NOT NULL,
  parcel_height       DECIMAL(10,2) NOT NULL,
  chargeable_weight   DECIMAL(10,2) NOT NULL,
  price               DECIMAL(12,2) NOT NULL,
  current_state       ENUM(
                        'WAITING',
                        'IN_TRANSIT',
                        'DELIVERED',
                        'CANCELLED'
                      ) NOT NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_at          DATETIME      DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)        REFERENCES users(id),
  FOREIGN KEY (origin_id)      REFERENCES cities(id),
  FOREIGN KEY (destination_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS shipment_state_history (
  id          CHAR(36)      PRIMARY KEY,
  shipment_id CHAR(36)      NOT NULL,
  state       ENUM(
                  'WAITING',
                  'IN_TRANSIT',
                  'DELIVERED',
                  'CANCELLED'
                ) NOT NULL,
  changed_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- Seed: 10 municipios de Antioquia con coordenadas aproximadas
INSERT INTO cities (id, name, latitude, longitude) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Medellín', 6.244203, -75.581212),
  ('22222222-2222-2222-2222-222222222222', 'Bello', 6.337200, -75.558500),
  ('33333333-3333-3333-3333-333333333333', 'Itagüí', 6.165085, -75.621698),
  ('44444444-4444-4444-4444-444444444444', 'Envigado', 6.165547, -75.586852),
  ('55555555-5555-5555-5555-555555555555', 'Sabaneta', 6.143900, -75.618554),
  ('66666666-6666-6666-6666-666666666666', 'La Estrella', 6.153973, -75.637043),
  ('77777777-7777-7777-7777-777777777777', 'Copacabana', 6.331100, -75.558000),
  ('88888888-8888-8888-8888-888888888888', 'Girardota', 6.377426, -75.448187),
  ('99999999-9999-9999-9999-999999999999', 'Rionegro', 6.148989, -75.374788),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Caldas', 6.087206, -75.635365)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed: tarifas de distancia (COP por km)
INSERT INTO fares (id, type, from_value, to_value, price) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'DISTANCE', 0,   10,  2000),
  ('d1000000-0000-0000-0000-000000000002', 'DISTANCE', 11,  15,  3000),
  ('d1000000-0000-0000-0000-000000000003', 'DISTANCE', 16, 20, 4000),
  ('d1000000-0000-0000-0000-000000000004', 'DISTANCE',21, 25, 5500),
  ('d1000000-0000-0000-0000-000000000005', 'DISTANCE',26, NULL,8000)
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Seed: tarifas de peso (COP por kg)
INSERT INTO fares (id, type, from_value, to_value, price) VALUES
  ('w1000000-0000-0000-0000-000000000001', 'WEIGHT',  0,    1, 1000),
  ('w1000000-0000-0000-0000-000000000002', 'WEIGHT',  2,    5, 3000),
  ('w1000000-0000-0000-0000-000000000003', 'WEIGHT',  6,   10, 5000),
  ('w1000000-0000-0000-0000-000000000004', 'WEIGHT', 11,   20, 9500),
  ('w1000000-0000-0000-0000-000000000005', 'WEIGHT', 21,  NULL,15000)
ON DUPLICATE KEY UPDATE price = VALUES(price);


-- Seed: usuario Daniel Tobon
INSERT INTO users (id, email, password_hash, full_name, document_type, document)
VALUES
  ('dc7fc307-8da0-47ac-a068-0e130f44aa97','danieltu1026@gmail.com','$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO','Daniel Tobon','CC','1026153155')