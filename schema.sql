DROP TABLE IF EXISTS users, signatures, user_profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    create_date VARCHAR(255) NOT NULL
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    signature TEXT NOT NULL
);


CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    age INTEGER,
    city VARCHAR(255),
    url VARCHAR(255)
);
