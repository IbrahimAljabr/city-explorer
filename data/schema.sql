CREATE TABLE IF NOT EXISTS city (
    id SERIAL PRIMARY KEY NOT NULL ,
    city_name VARCHAR(265),
    lon VARCHAR(265),
    lat VARCHAR(265)
);