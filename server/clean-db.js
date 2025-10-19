// Render PostgreSQL 데이터베이스 정리 스크립트
require('dotenv').config()
const { pool, closeDatabase } = require('./config/database')

async function cleanDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🧹 데이터베이스 정리 시작...')
    
    // 모든 테이블의 데이터 삭제 (외래 키 순서 고려)
    await client.query('DELETE FROM order_item_options')
    console.log('✅ order_item_options 삭제 완료')
    
    await client.query('DELETE FROM order_items')
    console.log('✅ order_items 삭제 완료')
    
    await client.query('DELETE FROM orders')
    console.log('✅ orders 삭제 완료')
    
    await client.query('DELETE FROM options')
    console.log('✅ options 삭제 완료')
    
    await client.query('DELETE FROM menus')
    console.log('✅ menus 삭제 완료')
    
    // 시퀀스 리셋
    await client.query('ALTER SEQUENCE menus_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE options_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE order_item_options_id_seq RESTART WITH 1')
    console.log('✅ ID 시퀀스 리셋 완료')
    
    console.log('🎉 데이터베이스 정리 완료!')
    
  } catch (error) {
    console.error('❌ 데이터베이스 정리 오류:', error)
  } finally {
    client.release()
    await closeDatabase()
    process.exit(0)
  }
}

cleanDatabase()

