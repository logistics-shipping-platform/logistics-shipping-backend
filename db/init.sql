CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  document_type ENUM('CC','CE','PASSPORT') NOT NULL,
  document VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, email, password_hash, full_name, document_type, document)
VALUES
  ('dc7fc307-8da0-47ac-a068-0e130f44aa97','danieltu1026@gmail.com','$2b$10$nSYNpFAV9OYdlVl3hr6u7uThvC04pNEhUdFA4uu7q8hHT4uI2IGbO','Daniel Tobon','CC','1026153155')