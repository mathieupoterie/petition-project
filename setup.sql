DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL,
    usersid FOREIGN KEY
);

SELECT *
FROM signatures
JOIN users
ON signatures.id= users.usersid;
