require('dotenv').config()

module.exports = {
  // 서버 설정
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 데이터베이스 설정
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    // SQLite 설정
    path: process.env.DB_PATH || './database.sqlite',
    // MySQL/PostgreSQL 설정 (향후 확장용)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'coffee_order_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },
  
  // CORS 설정
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  
  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // JWT 설정 (향후 인증용)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // API 설정
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api'
  },
  
  // 파일 업로드 설정
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '5MB',
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },
  
  // 캐시 설정 (Redis)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  
  // 이메일 설정 (향후 알림용)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || ''
    }
  },
  
  // 보안 설정
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15분
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 최대 100 요청
    }
  }
}
