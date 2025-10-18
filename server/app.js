const express = require('express')
const cors = require('cors')
const config = require('./config')
const { initDatabase, seedDatabase } = require('./config/database')

const app = express()

// 미들웨어 설정
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '먕이네 커피 주문 API 서버',
    version: '1.0.0',
    status: 'running'
  })
})

// API 라우트
app.use('/api/menus', require('./routes/menus'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/inventory', require('./routes/inventory'))

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다'
    }
  })
})

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다'
    }
  })
})

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await initDatabase()
    await seedDatabase()
    
    const PORT = config.port
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`)
      console.log(`📱 API 엔드포인트: http://localhost:${PORT}`)
      console.log(`🗄️ 데이터베이스: ${config.database.path}`)
    })
  } catch (error) {
    console.error('서버 시작 오류:', error)
    process.exit(1)
  }
}

startServer()
