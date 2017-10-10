DROP TABLE IF EXISTS messages;

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    first_user_id INT NOT NULL,
    second_user_id INT NOT NULL,
    message VARCHAR NOT NULL,
    message_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);