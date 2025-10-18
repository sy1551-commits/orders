const { Pool } = require('pg')
const config = require('../config')

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
})

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다')
})

pool.on('error', (err) => {
  console.error('PostgreSQL 연결 오류:', err)
})

// 데이터베이스 초기화
const initDatabase = async () => {
  try {
    const client = await pool.connect()
    
    // 메뉴 테이블 생성
    await client.query(`
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
      )
    `)

    // 옵션 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
      )
    `)

    // 주문 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT '주문 접수',
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 주문 항목 테이블 생성
    await client.query(`
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
      )
    `)

    // 주문 항목 옵션 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_item_options (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        option_name VARCHAR(50) NOT NULL,
        option_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES options(id)
      )
    `)

    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders(order_time)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `)

    client.release()
    console.log('✅ 데이터베이스 테이블이 초기화되었습니다')
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error)
    throw error
  }
}

// 초기 데이터 삽입
const seedDatabase = async () => {
  try {
    const client = await pool.connect()

    // 메뉴 데이터 삽입
    const menuData = [
      ['아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '/images/americano-ice.jpg', 15],
      ['아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '/images/americano-hot.jpg', 8],
      ['카페라떼', '부드러운 카페라떼', 5000, '/images/cafe-latte.jpg', 3]
    ]

    for (const menu of menuData) {
      await client.query(`
        INSERT INTO menus (name, description, price, image, stock) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, menu)
    }

    // 옵션 데이터 삽입
    const optionData = [
      [1, '샷 추가', 500],
      [1, '시럽 추가', 0],
      [2, '샷 추가', 500],
      [2, '시럽 추가', 0],
      [3, '샷 추가', 500],
      [3, '시럽 추가', 0]
    ]

    for (const option of optionData) {
      await client.query(`
        INSERT INTO options (menu_id, name, price) 
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, option)
    }

    client.release()
    console.log('✅ 초기 데이터가 삽입되었습니다')
  } catch (error) {
    console.error('초기 데이터 삽입 오류:', error)
    throw error
  }
}

// 데이터베이스 연결 종료
const closeDatabase = async () => {
  try {
    await pool.end()
    console.log('✅ 데이터베이스 연결이 종료되었습니다')
  } catch (error) {
    console.error('데이터베이스 연결 종료 오류:', error)
  }
}

// 쿼리 실행 헬퍼 함수
const query = async (text, params) => {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  query,
  initDatabase,
  seedDatabase,
  closeDatabase
}