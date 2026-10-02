-- =====================================================
-- MAHADINE — Reference schema (informational)
-- =====================================================
-- NOTE: The Spring Boot app creates/updates these tables automatically at
-- startup via Hibernate (spring.jpa.hibernate.ddl-auto=update), and seeds
-- demo data via DataInitializer.java on first run. You do NOT need to run
-- this file manually for the app to work.
--
-- This file is provided so you can inspect the exact schema, run it against
-- a fresh MySQL instance for testing, or use it as documentation.
-- =====================================================

CREATE DATABASE IF NOT EXISTS mahadine
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mahadine;
-- (In the actual application, the schema is created inside the database
--  named by DB_NAME / MYSQLDATABASE, which defaults to "mahadine" locally.)

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    location VARCHAR(150),
    city VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(150),
    cuisine VARCHAR(100),
    price_range VARCHAR(10),
    rating DOUBLE DEFAULT 4.0,
    opening_time TIME,
    closing_time TIME,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS restaurant_tables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    table_type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    number_of_guests INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    special_request VARCHAR(500),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    INDEX idx_table_date_time (table_id, reservation_date, reservation_time)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000),
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200),
    message VARCHAR(2000) NOT NULL,
    user_id BIGINT NULL,
    status VARCHAR(20) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
