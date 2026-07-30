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
INSERT IGNORE INTO Categories (id, name) VALUES
  (1, 'Strategy'),
  (2, 'Family'),
  (3, 'Cooperative'),
  (4, 'Party'),
  (5, 'Expert'),
  (6, 'Children'),
  (7, 'Role-Playing'),
  (8, 'Card Game');

-- ================================================
-- Default Sample Games
-- ================================================
INSERT IGNORE INTO Games (id, title, description, price, stock_quantity, image_url, player_count, min_age, play_duration) VALUES
  (1, 'Catan (Settlers of Catan)', 'Trade, build, and settle the island of Catan in this legendary strategy board game. Collect resources and build settlements, cities, and roads.', 49.99, 15, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800&auto=format&fit=crop', '3-4', 10, '60-120 min'),
  (2, 'Ticket to Ride', 'A cross-country train adventure where players collect cards of various types of train cars to claim railway routes connecting cities.', 44.99, 12, 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=800&auto=format&fit=crop', '2-5', 8, '30-60 min'),
  (3, 'Codenames', 'Two rival spymasters know the secret identities of 25 agents. Their teammates know the agents only by their CODENAMES. A thrilling party game.', 19.99, 25, 'https://images.unsplash.com/photo-1563941433-b6a0946530d8?q=80&w=800&auto=format&fit=crop', '2-8+', 14, '15-30 min'),
  (4, 'Pandemic', 'You and your team are members of a disease control team fighting four deadly plagues. Work together to save humanity in this cooperative masterpiece.', 39.99, 8, 'https://images.unsplash.com/photo-1585504198199-20277593b94f?q=80&w=800&auto=format&fit=crop', '2-4', 8, '45 min'),
  (5, 'Wingspan', 'You are bird enthusiasts attempting to discover and attract the best birds to your network of wildlife preserves. Beautiful strategy game.', 59.99, 10, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop', '1-5', 10, '40-70 min'),
  (6, 'Azul', 'Tile-placement board game in which players compete for the highest score by placing tiles to decorate the walls of the Royal Palace of Evora.', 34.99, 20, 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?q=80&w=800&auto=format&fit=crop', '2-4', 8, '30-45 min');

-- ================================================
-- Default Game Categories Mapping
-- ================================================
INSERT IGNORE INTO Game_Categories (game_id, category_id) VALUES
  (1, 1), (1, 2),
  (2, 2), (2, 1),
  (3, 4), (3, 8),
  (4, 3), (4, 1),
  (5, 1), (5, 2),
  (6, 1), (6, 2);

-- ================================================
-- Default Users (Password: "123456" bcrypt hashed)
-- ================================================
INSERT IGNORE INTO Users (id, name, email, password, role) VALUES
  (1, 'Admin User', 'admin@boardgame.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'admin'),
  (2, 'Demo User', 'user@boardgame.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'client');
