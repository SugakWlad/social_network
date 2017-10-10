DROP TABLE IF EXISTS friends;

CREATE TABLE friends(
    id SERIAL PRIMARY KEY,
    sender INT NOT NULL,
    recipient INT NOT NULL,
    status INT NOT NULL,
    request_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);