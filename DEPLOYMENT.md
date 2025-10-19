# 🚀 Render.com 배포 가이드

## 📋 배포 순서

### 1단계: GitHub에 코드 푸시

```bash
git add .
git commit -m "배포 준비 완료"
git push origin main
```

---

## 2단계: PostgreSQL 데이터베이스 생성 (Render)

### 2-1. Render.com 로그인
- https://render.com 접속
- GitHub 계정으로 로그인

### 2-2. PostgreSQL 데이터베이스 생성
1. **Dashboard** → **New +** → **PostgreSQL** 클릭
2. 설정:
   - **Name**: `coffee-order-db`
   - **Database**: `coffee_order_db`
   - **User**: 자동 생성
   - **Region**: Singapore (가장 가까운 지역)
   - **Plan**: Free
3. **Create Database** 클릭
4. **Internal Database URL** 복사 (나중에 사용)

---

## 3단계: 백엔드 배포 (Render)

### 3-1. Web Service 생성
1. **Dashboard** → **New +** → **Web Service** 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `coffee-order-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3-2. 환경 변수 설정
**Environment Variables** 섹션에서 추가:

```
PORT=3001
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=[PostgreSQL Internal Host]
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=[PostgreSQL User]
DB_PASSWORD=[PostgreSQL Password]
CORS_ORIGIN=https://your-frontend-url.onrender.com
LOG_LEVEL=info
```

💡 **팁**: PostgreSQL의 **Internal Database URL**을 파싱하여 입력
- 형식: `postgresql://user:password@host:port/database`

또는 **DATABASE_URL** 환경 변수 하나로 설정 가능:
```
DATABASE_URL=[PostgreSQL Internal Database URL]
```

### 3-3. 배포
- **Create Web Service** 클릭
- 자동으로 빌드 및 배포 시작
- 배포 완료 후 URL 복사: `https://coffee-order-backend.onrender.com`

---

## 4단계: 프론트엔드 배포 (Render)

### 4-1. Static Site 생성
1. **Dashboard** → **New +** → **Static Site** 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `coffee-order-frontend`
   - **Branch**: `main`
   - **Root Directory**: `ui`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 4-2. 환경 변수 설정
**Environment Variables** 섹션에서 추가:

```
VITE_API_BASE_URL=https://coffee-order-backend.onrender.com/api
```

### 4-3. 배포
- **Create Static Site** 클릭
- 자동으로 빌드 및 배포 시작
- 배포 완료 후 URL 확인: `https://coffee-order-frontend.onrender.com`

---

## 5단계: CORS 설정 업데이트

### 5-1. 백엔드 환경 변수 수정
1. 백엔드 서비스로 이동
2. **Environment** 탭 클릭
3. `CORS_ORIGIN` 값을 프론트엔드 URL로 변경:
   ```
   CORS_ORIGIN=https://coffee-order-frontend.onrender.com
   ```
4. **Save Changes** 클릭
5. 자동으로 재배포됨

---

## 6단계: 데이터베이스 초기화

### 6-1. 백엔드 로그 확인
- 백엔드 서비스의 **Logs** 탭에서 확인
- 데이터베이스 테이블이 자동으로 생성되었는지 확인

### 6-2. 초기 데이터 확인
- 앱에 접속하여 메뉴가 표시되는지 확인
- 초기 데이터가 자동으로 삽입되었는지 확인

---

## 🎯 배포 완료 체크리스트

- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] 백엔드 배포 완료
- [ ] 백엔드 환경 변수 설정 완료
- [ ] 프론트엔드 배포 완료
- [ ] 프론트엔드 환경 변수 설정 완료
- [ ] CORS 설정 업데이트 완료
- [ ] 데이터베이스 초기화 확인
- [ ] 메뉴 표시 확인
- [ ] 주문 기능 테스트
- [ ] 관리자 화면 테스트

---

## 🔧 트러블슈팅

### 문제 1: CORS 오류
**증상**: 프론트엔드에서 API 호출 시 CORS 오류 발생

**해결**:
1. 백엔드 환경 변수에서 `CORS_ORIGIN` 확인
2. 프론트엔드 URL이 정확한지 확인
3. `https://` 포함 여부 확인

### 문제 2: 데이터베이스 연결 오류
**증상**: 백엔드 로그에 데이터베이스 연결 오류

**해결**:
1. PostgreSQL 환경 변수 확인
2. **Internal Database URL** 사용 (External이 아님)
3. 데이터베이스가 같은 Region에 있는지 확인

### 문제 3: 이미지가 표시되지 않음
**증상**: 커피 이미지가 깨짐

**해결**:
1. `ui/public/images/` 폴더의 이미지가 Git에 포함되었는지 확인
2. `.gitignore`에서 이미지 폴더가 제외되지 않았는지 확인

### 문제 4: Free Plan 제한
**증상**: 15분 동안 요청이 없으면 서버가 sleep 상태로 전환

**해결**:
- 첫 요청 시 서버가 깨어나는데 30초~1분 소요
- 사용자에게 "서버 시작 중..." 메시지 표시 고려
- 또는 Paid Plan으로 업그레이드

---

## 📚 참고 자료

- [Render Documentation](https://render.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

## 🎉 배포 완료!

프론트엔드 URL: `https://coffee-order-frontend.onrender.com`
백엔드 URL: `https://coffee-order-backend.onrender.com`

**먕이네 커피 주문 앱이 성공적으로 배포되었습니다!** ☕🚀
