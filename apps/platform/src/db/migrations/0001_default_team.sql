INSERT INTO teams (slug, name) VALUES ('default', 'Default team')
ON CONFLICT (slug) DO NOTHING;
