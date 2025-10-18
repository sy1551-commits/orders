-- PostgreSQL 스키마 파일
-- 커피 주문 시스템 데이터베이스 스키마

-- 메뉴 테이블
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 옵션 테이블
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT '주문 접수',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 항목 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_id INTEGER NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  item_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);

-- 주문 항목 옵션 테이블
CREATE TABLE IF NOT EXISTS order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  option_name VARCHAR(50) NOT NULL,
  option_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders(order_time);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON menus(is_active);
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);

-- 초기 데이터 삽입
INSERT INTO menus (name, description, price, image, stock) VALUES
('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '/images/americano-ice.jpg', 15),
('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '/images/americano-hot.jpg', 8),
('카페라떼', '부드러운 카페라떼', 5000, '/images/cafe-latte.jpg', 3)
ON CONFLICT DO NOTHING;

INSERT INTO options (menu_id, name, price) VALUES
(1, '샷 추가', 500),
(1, '시럽 추가', 0),
(2, '샷 추가', 500),
(2, '시럽 추가', 0),
(3, '샷 추가', 500),
(3, '시럽 추가', 0)
ON CONFLICT DO NOTHING;