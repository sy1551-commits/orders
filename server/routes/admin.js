const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')

// 데이터베이스 정리 (임시 관리자 API)
router.post('/clean-database', async (req, res) => {
  const client = await pool.connect()
  
  try {
    console.log('🧹 데이터베이스 정리 시작...')
    
    // 모든 테이블의 데이터 삭제 (외래 키 순서 고려)
    await client.query('DELETE FROM order_item_options')
    await client.query('DELETE FROM order_items')
    await client.query('DELETE FROM orders')
    await client.query('DELETE FROM options')
    await client.query('DELETE FROM menus')
    
    // 시퀀스 리셋
    await client.query('ALTER SEQUENCE menus_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE options_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE order_item_options_id_seq RESTART WITH 1')
    
    console.log('✅ 데이터베이스 정리 완료!')
    
    res.json({ 
      success: true, 
      message: '데이터베이스가 정리되었습니다. 서버를 재시작하면 초기 데이터가 삽입됩니다.' 
    })
    
  } catch (error) {
    console.error('데이터베이스 정리 오류:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  } finally {
    client.release()
  }
})

module.exports = router

