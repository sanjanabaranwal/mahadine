-- =====================================================
-- MAHADINE — Reference seed data (informational)
-- =====================================================
-- NOTE: In the running application, demo data is inserted automatically by
-- DataInitializer.java (Java code, not this file), because the admin and
-- demo user passwords must be BCrypt-hashed at insert time. This file
-- mirrors that same data in plain SQL for reference/manual testing only.
--
-- The BCrypt hash below for both accounts corresponds to the documented
-- demo passwords (Admin@12345 / User@12345). If you run this file manually,
-- you can log in with those credentials, exactly as with the auto-seeded data.
-- =====================================================

USE mahadine;

-- Passwords are BCrypt hashes - NEVER store plain text passwords.
-- admin@mahadine.com -> Admin@12345
-- user@mahadine.com  -> User@12345
INSERT INTO users (name, email, password, phone, role, enabled, created_at, updated_at) VALUES
('MAHADINE Admin', 'admin@mahadine.com', '$2b$10$Rofo2ElqukiH6zg6hwsSseewoYsfAHO7ZINv/UuR33MwBQEtra3Dy', '9820000001', 'ADMIN', TRUE, NOW(), NOW()),
('Demo Guest', 'user@mahadine.com', '$2b$10$ocm1iMot4OLumPJwp3kqEOaz1u2XKo2c5W5pVTHi0Kn64PawJghFC', '9820000002', 'USER', TRUE, NOW(), NOW());

INSERT INTO restaurants (name, description, location, city, address, phone, email, cuisine, price_range, rating, opening_time, closing_time, image_url, status, created_at, updated_at) VALUES
('MAHADINE - The Bombay Table', 'A refined ode to Mumbai''s coastal and street-food heritage.', 'Bandra West', 'Mumbai', '12 Waterfield Road, Bandra West', '022-26400001', 'bandra@mahadine.com', 'Multi-cuisine', '$$$', 4.6, '12:00:00', '23:30:00', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', 'ACTIVE', NOW(), NOW()),
('Spice Route Mumbai', 'Bold Indian spices and slow-cooked classics.', 'Colaba', 'Mumbai', '45 Shahid Bhagat Singh Road, Colaba', '022-22040002', 'colaba@mahadine.com', 'North Indian', '$$', 4.4, '11:30:00', '23:00:00', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', 'ACTIVE', NOW(), NOW()),
('Coastal Pearl', 'Fresh Konkan seafood and coconut curries.', 'Worli', 'Mumbai', '8 Dr Annie Besant Road, Worli', '022-24950003', 'worli@mahadine.com', 'Seafood', '$$$', 4.7, '12:00:00', '23:00:00', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'ACTIVE', NOW(), NOW());

-- (Remaining 7 demo restaurants, all tables, and demo reservations are
--  inserted automatically by DataInitializer.java at application startup.)
