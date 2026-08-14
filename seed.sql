-- Insert sample data into admin_users
INSERT INTO admin_users (email, name, role, must_change_password)
VALUES ('admin@example.com', 'Super Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample data into members
INSERT INTO members (name, first_name, last_name, email, county, blood_type, id_number, nationality, id_type)
VALUES ('Jane Doe', 'Jane', 'Doe', 'jane.doe@example.com', 'Nairobi', 'O+', '87654321', 'Kenyan', 'National ID');

-- Insert sample data into events
INSERT INTO events (title, start_date, location, status, description)
VALUES ('Emergency Response Training', '2026-11-20T09:00:00Z', 'Nairobi Central', 'upcoming', 'Basic first aid and CPR training.');

-- Insert sample data into posts
INSERT INTO posts (title, slug, body_md, published, author)
VALUES ('The Importance of Preparedness', 'importance-of-preparedness', '# Preparedness\nAlways be ready for emergencies.', true, 'Admin');

-- Insert sample data into projects
INSERT INTO projects (title, description, status)
VALUES ('First Aid Outreach', 'Teaching first aid in schools.', 'ongoing');

-- Insert sample data into products
INSERT INTO products (name, price, description)
VALUES ('Emergency Kit', 2500, 'Comprehensive first aid kit.');

-- Insert sample data into gallery
INSERT INTO gallery (title, image_url)
VALUES ('Training Day', 'https://via.placeholder.com/800x600.png?text=Training');

-- Insert sample data into contacts
INSERT INTO contacts (contact_type, contact_value, sort_order)
VALUES ('Phone', '+254700000000', 1);

-- Insert sample data into social_media
INSERT INTO social_media (platform, url, media_type)
VALUES ('Facebook', 'https://facebook.com/example', 'Social Page');

-- Insert sample data into faqs
INSERT INTO faqs (question, answer)
VALUES ('Who can join SER?', 'Anyone with a passion for volunteering and emergency response.');

-- Insert sample data into donations
INSERT INTO donations (tracking_id, merchant_reference, amount, currency, status, payment_method)
VALUES ('SEED-DONATION-123', 'SEED-REF-123', 5000, 'KES', 'COMPLETED', 'M-PESA');
