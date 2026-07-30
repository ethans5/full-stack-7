-- ================================================
-- Board Game Online Shop
-- Database initialization script
-- ================================================

CREATE DATABASE IF NOT EXISTS boardgame_shop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE boardgame_shop;

-- ================================================
-- Table: Users
-- Roles: 'client' or 'admin'
-- ================================================
CREATE TABLE IF NOT EXISTS Users (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================================
-- Table: Categories
-- ================================================
CREATE TABLE IF NOT EXISTS Categories (
  id   INT          AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ================================================
-- Table: Games
-- ================================================
CREATE TABLE IF NOT EXISTS Games (
  id             INT            AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)   NOT NULL,
  description    TEXT           NULL,
  price          DECIMAL(10, 2) NOT NULL,
  stock_quantity INT            NOT NULL DEFAULT 0,
  image_url      VARCHAR(500)   NULL,
  rules_pdf_url  VARCHAR(500)   NULL,
  player_count   VARCHAR(50)    NULL,     -- e.g. "2-4"
  min_age        INT            NULL,
  play_duration  VARCHAR(50)    NULL,     -- e.g. "30-60 min"
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================================================
-- Pivot table: Game_Categories (many-to-many)
-- ================================================
CREATE TABLE IF NOT EXISTS Game_Categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  game_id     INT NOT NULL,
  category_id INT NOT NULL,
  UNIQUE KEY unique_game_category (game_id, category_id),
  FOREIGN KEY (game_id)     REFERENCES Games(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================
-- Table: Orders
-- Statuses: 'pending', 'paid', 'shipped'
-- ================================================
CREATE TABLE IF NOT EXISTS Orders (
  id                INT            AUTO_INCREMENT PRIMARY KEY,
  user_id           INT            NOT NULL,
  total_price       DECIMAL(10, 2) NOT NULL,
  status            ENUM('pending', 'paid', 'shipped') NOT NULL DEFAULT 'pending',
  stripe_session_id VARCHAR(255)   NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================================================
-- Table: Order_Items
-- ================================================
CREATE TABLE IF NOT EXISTS Order_Items (
  id         INT            AUTO_INCREMENT PRIMARY KEY,
  order_id   INT            NOT NULL,
  game_id    INT            NOT NULL,
  quantity   INT            NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id)  REFERENCES Games(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ================================================
-- Default categories
-- ================================================
INSERT IGNORE INTO Categories (name) VALUES
  ('Strategy'),
  ('Family'),
  ('Cooperative'),
  ('Party'),
  ('Expert'),
  ('Children'),
  ('Role-Playing'),
  ('Card Game');
