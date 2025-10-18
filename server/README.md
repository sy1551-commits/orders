# 먕이네 커피 주문 API 서버

Express.js를 사용한 커피 주문 시스템의 백엔드 API 서버입니다.

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 서버 실행
```bash
npm start
```

## 📡 API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/options/:menuId` - 메뉴 옵션 조회

### 주문 관련
- `GET /api/orders` - 주문 목록 조회 (관리자용)
- `POST /api/orders` - 새 주문 생성
- `GET /api/orders/:orderId` - 특정 주문 조회
- `PUT /api/orders/:orderId/status` - 주문 상태 변경

### 재고 관리
- `GET /api/inventory` - 재고 현황 조회
- `PUT /api/inventory/:menuId` - 재고 수량 수정

## 🏗️ 프로젝트 구조

```
server/
├── app.js                 # 메인 서버 파일
├── config.js             # 설정 파일
├── routes/               # 라우트 파일들
│   ├── menus.js
│   ├── orders.js
│   └── inventory.js
├── controllers/          # 컨트롤러 파일들
│   ├── menuController.js
│   ├── orderController.js
│   └── inventoryController.js
├── models/              # 모델 파일들
│   ├── Menu.js
│   └── Order.js
└── package.json
```

## 🔧 환경 설정

### .env 파일 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 설정
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# MySQL/PostgreSQL 설정 (향후 확장용)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coffee_order_db
DB_USER=root
DB_PASSWORD=

# CORS 설정
CORS_ORIGIN=http://localhost:5173

# 로깅 설정
LOG_LEVEL=info

# JWT 설정 (향후 인증용)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# API 설정
API_VERSION=v1
API_PREFIX=/api

# 파일 업로드 설정
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads

# 캐시 설정 (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 이메일 설정 (향후 알림용)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# 보안 설정
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 환경 변수 설명

#### 서버 설정
- `PORT`: 서버 포트 (기본: 3001)
- `NODE_ENV`: 실행 환경 (development/production)

#### 데이터베이스 설정
- `DB_TYPE`: 데이터베이스 타입 (sqlite/mysql/postgresql)
- `DB_PATH`: SQLite 파일 경로
- `DB_HOST`: 데이터베이스 호스트
- `DB_PORT`: 데이터베이스 포트
- `DB_NAME`: 데이터베이스 이름
- `DB_USER`: 데이터베이스 사용자
- `DB_PASSWORD`: 데이터베이스 비밀번호

#### 보안 설정
- `JWT_SECRET`: JWT 토큰 암호화 키
- `BCRYPT_ROUNDS`: 비밀번호 해싱 라운드 수
- `RATE_LIMIT_WINDOW`: Rate limiting 시간 (분)
- `RATE_LIMIT_MAX`: Rate limiting 최대 요청 수

## 📝 API 사용 예시

### 메뉴 조회
```bash
curl http://localhost:3001/api/menus
```

### 주문 생성
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menuId": 1,
        "quantity": 2,
        "options": [
          {"optionId": 1, "quantity": 1}
        ]
      }
    ]
  }'
```

### 주문 상태 변경
```bash
curl -X PUT http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "제조 중"}'
```
