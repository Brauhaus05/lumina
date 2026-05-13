-- Add editorial fields required by the Chronicle design
ALTER TABLE posts
  ADD COLUMN featured boolean NOT NULL DEFAULT false,
  ADD COLUMN cover_image text,
  ADD COLUMN excerpt text,
  ADD COLUMN category text,
  ADD COLUMN author text;
