-- Create tables for crossword app
-- This should be run on your MySQL or PostgreSQL database

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puzzles (
  id VARCHAR(255) PRIMARY KEY,
  puz_json TEXT NOT NULL,
  puz_key VARCHAR(255),
  title VARCHAR(255),
  author VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS user_puzzles (
  id VARCHAR(255) PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  puzzle_id VARCHAR(255) NOT NULL,
  used_check BOOLEAN NOT NULL DEFAULT FALSE,
  used_reveal BOOLEAN NOT NULL DEFAULT FALSE,
  used_clear BOOLEAN NOT NULL DEFAULT FALSE,
  time_in_seconds INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_profile_puzzle (profile_id, puzzle_id),
  INDEX idx_profile_created (profile_id, created_at),
  INDEX idx_created_at (created_at)
);
