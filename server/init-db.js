// Render PostgreSQL 데이터베이스 초기화 스크립트
require('dotenv').config()
const { initDatabase, seedDatabase, closeDatabase } = require('./config/database')

async function initRenderDB() {
  try {
    console.log('🔄 Render PostgreSQL 데이터베이스 초기화 시작...')
    console.log(`📍 연결 정보: ${process.env.DB_HOST}:${process.env.DB_PORT}`)
    console.log(`📦 데이터베이스: ${process.env.DB_NAME}`)
    
    // 데이터베이스 테이블 생성
    await initDatabase()
    console.log('✅ 테이블 생성 완료')
    
    // 초기 데이터 삽입
    await seedDatabase()
    console.log('✅ 초기 데이터 삽입 완료')
    
    // 연결 종료
    await closeDatabase()
    console.log('✅ 데이터베이스 초기화 완료!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error)
    process.exit(1)
  }
}

initRenderDB()
