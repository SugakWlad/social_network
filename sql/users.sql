DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image VARCHAR,
    bio VARCHAR,
    id_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);