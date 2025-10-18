# 커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱

### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스택
- 프런트엔드: HTML, CSS, 리액트, 자바스크립트
- 벡엔드: Node.js, Express
- 데이터베이스: PostgreSQL

## 3. 기본 사항
 - 프런트엔드와 벡엔드를 따로 개발
 - 기본적인 웹 기술만 사용
 - 학습 목적이므로 사용자 인증이나 결제 기능을 제외
 - 메뉴는 커피 메뉴만 있음

## 4. 주문하기 화면 상세 설계

### 4.1 화면 구성
주문하기 화면은 크게 3개의 섹션으로 구성됩니다:
- **헤더 섹션**: 앱 브랜딩 및 네비게이션
- **메뉴 섹션**: 상품 카드 및 옵션 선택
- **장바구니 섹션**: 선택된 상품 목록 및 주문 버튼

### 4.2 헤더 섹션
#### 4.2.1 구성 요소
- **브랜드명**: 좌측 상단에 "COZY" 표시
- **탭 버튼**: 우측 상단에 "주문하기"와 "관리자" 버튼
  - 현재 활성 탭은 "주문하기"로 하이라이트 표시
  - "관리자" 버튼 클릭 시 관리자 화면으로 이동

#### 4.2.2 디자인 요구사항
- 헤더 높이: 60px
- 브랜드명 폰트: 24px, 굵게
- 탭 버튼 스타일: 둥근 모서리, 활성/비활성 상태 구분

### 4.3 메뉴 섹션
#### 4.3.1 상품 카드 구조
각 상품은 카드 형태로 표시되며, 다음 요소들을 포함합니다:

**상품 이미지**
- 크기: 200px × 150px
- 플레이스홀더: 상품 이미지가 없을 경우 기본 이미지 표시
- 이미지 로딩 실패 시 대체 텍스트 표시

**상품 정보**
- 상품명: 18px, 굵게
- 가격: 16px, 주황색 강조
- 설명: 14px, 회색 텍스트 (선택사항)

**옵션 선택**
- 샷 추가: 체크박스 + "샷 추가 (+500원)" 라벨
- 시럽 추가: 체크박스 + "시럽 추가 (+0원)" 라벨
- 옵션 선택 시 가격 실시간 업데이트

**담기 버튼**
- 버튼 텍스트: "담기"
- 버튼 색상: 주 브랜드 컬러
- 호버 효과: 버튼 색상 변경

#### 4.3.2 상품 데이터 구조
```javascript
const product = {
  id: number,
  name: string,
  price: number,
  image: string,
  description: string,
  options: {
    shot: { name: string, price: number },
    syrup: { name: string, price: number }
  }
}
```

#### 4.3.3 레이아웃
- 상품 카드들은 3열 그리드로 배치
- 반응형 디자인: 모바일에서는 1열, 태블릿에서는 2열
- 카드 간격: 20px
- 카드 패딩: 16px

### 4.4 장바구니 섹션
#### 4.4.1 구성 요소
**장바구니 헤더**
- 제목: "장바구니"
- 폰트: 18px, 굵게

**상품 목록**
- 선택된 상품과 옵션 표시
- 수량 표시 (X 1, X 2 등)
- 개별 상품 가격 표시
- 상품 삭제 버튼 (X 아이콘)

**총 금액**
- "총 금액" 라벨
- 금액 표시: 20px, 굵게, 주황색
- 천 단위 구분 쉼표 표시

**주문 버튼**
- 버튼 텍스트: "주문하기"
- 버튼 크기: 전체 너비, 높이 50px
- 비활성 상태: 장바구니가 비어있을 때
- 활성 상태: 상품이 있을 때

#### 4.4.2 장바구니 데이터 구조
```javascript
const cartItem = {
  productId: number,
  productName: string,
  basePrice: number,
  options: {
    shot: boolean,
    syrup: boolean
  },
  quantity: number,
  totalPrice: number
}
```

### 4.5 사용자 인터랙션
#### 4.5.1 상품 옵션 선택
- 체크박스 클릭 시 옵션 추가/제거
- 옵션 변경 시 실시간 가격 계산
- 시각적 피드백: 체크된 옵션 하이라이트

#### 4.5.2 장바구니 추가
- "담기" 버튼 클릭 시 장바구니에 상품 추가
- 동일한 상품+옵션 조합이 있으면 수량 증가
- 다른 옵션 조합이면 별도 아이템으로 추가
- 성공 피드백: 토스트 메시지 또는 버튼 애니메이션

#### 4.5.3 장바구니 관리
- 상품 삭제: X 버튼 클릭으로 개별 상품 제거
- 수량 조정: +/- 버튼으로 수량 변경
- 총 금액 실시간 업데이트

#### 4.5.4 주문하기
- "주문하기" 버튼 클릭 시 주문 확인 모달 표시
- 주문 확인 후 주문 완료 처리
- 장바구니 초기화

### 4.6 반응형 디자인
#### 4.6.1 모바일 (320px ~ 768px)
- 상품 카드: 1열 배치
- 장바구니: 하단 고정
- 터치 친화적 버튼 크기 (최소 44px)

#### 4.6.2 태블릿 (768px ~ 1024px)
- 상품 카드: 2열 배치
- 장바구니: 우측 사이드바 또는 하단

#### 4.6.3 데스크톱 (1024px 이상)
- 상품 카드: 3열 배치
- 장바구니: 우측 사이드바

### 4.7 접근성 (Accessibility)
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 4.5:1 이상 유지
- 포커스 표시기 명확히 표시

### 4.8 성능 요구사항
- 초기 로딩 시간: 3초 이내
- 이미지 지연 로딩 (Lazy Loading)
- 상품 목록 가상화 (대량 데이터 처리 시)
- 장바구니 상태 로컬 스토리지 저장

## 5. 관리자 화면 상세 설계

### 5.1 화면 구성
관리자 화면은 크게 4개의 섹션으로 구성됩니다:
- **헤더 섹션**: 앱 브랜딩 및 네비게이션
- **관리자 대시보드**: 주문 현황 요약
- **재고 현황**: 상품별 재고 관리
- **주문 현황**: 개별 주문 처리

### 5.2 헤더 섹션
#### 5.2.1 구성 요소
- **브랜드명**: 좌측 상단에 "COZY" 표시
- **탭 버튼**: 우측 상단에 "주문하기"와 "관리자" 버튼
  - 현재 활성 탭은 "관리자"로 하이라이트 표시
  - "주문하기" 버튼 클릭 시 주문 화면으로 이동

#### 5.2.2 디자인 요구사항
- 헤더 높이: 60px
- 브랜드명 폰트: 24px, 굵게
- 탭 버튼 스타일: 둥근 모서리, 활성/비활성 상태 구분
- 활성 탭: 테두리 강조 표시

### 5.3 관리자 대시보드 섹션
#### 5.3.1 구성 요소
주문 현황을 한눈에 볼 수 있는 요약 카드들:

**총 주문**
- 라벨: "총 주문"
- 값: 전체 주문 수 표시
- 색상: 파란색

**주문 접수**
- 라벨: "주문 접수"
- 값: 접수된 주문 수 표시
- 색상: 주황색

**제조 중**
- 라벨: "제조 중"
- 값: 제조 중인 주문 수 표시
- 색상: 노란색

**제조 완료**
- 라벨: "제조 완료"
- 값: 완료된 주문 수 표시
- 색상: 초록색

#### 5.3.2 데이터 구조
```javascript
const dashboardStats = {
  totalOrders: number,
  receivedOrders: number,
  inProduction: number,
  completed: number
}
```

#### 5.3.3 레이아웃
- 4개의 통계 카드를 2x2 그리드로 배치
- 각 카드 크기: 150px × 100px
- 카드 간격: 20px
- 실시간 업데이트

### 5.4 재고 현황 섹션
#### 5.4.1 구성 요소
각 상품별 재고 상태를 관리하는 카드들:

**상품 정보**
- 상품명: 16px, 굵게
- 현재 재고: "X개" 형태로 표시
- 재고 수량: 18px, 굵게, 파란색

**재고 조정 버튼**
- 증가 버튼: "+" 아이콘, 초록색
- 감소 버튼: "-" 아이콘, 빨간색
- 버튼 크기: 30px × 30px
- 클릭 시 즉시 재고 수량 변경

#### 5.4.2 재고 관리 기능
- 재고 증가: + 버튼 클릭 시 재고 +1
- 재고 감소: - 버튼 클릭 시 재고 -1 (최소 0)
- 재고 부족 알림: 재고가 5개 이하일 때 경고 표시
- 재고 0 알림: 재고가 0일 때 상품 비활성화

#### 5.4.3 데이터 구조
```javascript
const inventoryItem = {
  productId: number,
  productName: string,
  currentStock: number,
  minStock: number,
  maxStock: number
}
```

#### 5.4.4 레이아웃
- 상품 카드들을 3열 그리드로 배치
- 반응형 디자인: 모바일에서는 1열, 태블릿에서는 2열
- 카드 간격: 20px
- 카드 패딩: 16px

### 5.5 주문 현황 섹션
#### 5.5.1 구성 요소
개별 주문을 처리하는 리스트:

**주문 정보**
- 주문 시간: "월 일 시:분" 형태
- 상품 정보: "상품명 x 수량" 형태
- 주문 금액: "X,XXX원" 형태
- 주문 상태: 현재 상태 표시

**주문 처리 버튼**
- "주문 접수" 버튼: 주문을 접수 상태로 변경
- "제조 시작" 버튼: 제조 중 상태로 변경
- "제조 완료" 버튼: 완료 상태로 변경
- 버튼 색상: 상태에 따라 변경

#### 5.5.2 주문 상태 관리
**주문 상태 플로우**
1. 주문 접수 → 제조 중 → 제조 완료
2. 각 상태별 버튼 표시
3. 상태 변경 시 실시간 업데이트

**주문 데이터 구조**
```javascript
const order = {
  id: number,
  timestamp: string,
  items: [
    {
      productId: number,
      productName: string,
      quantity: number,
      price: number,
      options: object
    }
  ],
  totalAmount: number,
  status: 'received' | 'in_production' | 'completed',
  createdAt: string
}
```

#### 5.5.3 주문 목록 표시
- 최신 주문부터 위에 표시
- 스크롤 가능한 리스트
- 주문이 많을 경우 페이지네이션
- 주문 상태별 필터링 기능

### 5.6 사용자 인터랙션
#### 5.6.1 재고 관리
- 재고 조정 버튼 클릭 시 즉시 반영
- 재고 변경 시 시각적 피드백
- 재고 부족 시 경고 메시지 표시

#### 5.6.2 주문 처리
- 주문 상태 변경 시 확인 모달 표시
- 상태 변경 후 대시보드 통계 업데이트
- 주문 완료 시 알림 표시

#### 5.6.3 실시간 업데이트
- 새 주문 접수 시 자동 새로고침
- 주문 상태 변경 시 실시간 반영
- 재고 변경 시 즉시 업데이트

### 5.7 반응형 디자인
#### 5.7.1 모바일 (320px ~ 768px)
- 대시보드: 2x2 그리드
- 재고 현황: 1열 배치
- 주문 현황: 전체 너비, 세로 스크롤

#### 5.7.2 태블릿 (768px ~ 1024px)
- 대시보드: 2x2 그리드
- 재고 현황: 2열 배치
- 주문 현황: 좌측 2/3, 재고 현황 우측 1/3

#### 5.7.3 데스크톱 (1024px 이상)
- 대시보드: 4열 배치
- 재고 현황: 3열 배치
- 주문 현황: 좌측 2/3, 재고 현황 우측 1/3

### 5.8 접근성 (Accessibility)
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 4.5:1 이상 유지
- 상태 변경 시 음성 알림 (선택사항)

### 5.9 성능 요구사항
- 실시간 데이터 업데이트 (WebSocket 또는 폴링)
- 대시보드 로딩 시간: 2초 이내
- 주문 목록 가상화 (대량 데이터 처리 시)
- 재고 변경 시 즉시 반영

### 5.10 데이터 동기화
- 주문 화면과 관리자 화면 간 실시간 동기화
- 재고 변경 시 주문 화면 상품 상태 업데이트
- 주문 상태 변경 시 사용자에게 알림 (선택사항)

---

## 6. 백엔드 개발 요구사항

### 6.1 데이터 모델 설계

#### 6.1.1 Menus (메뉴)
**목적**: 커피 메뉴 정보와 재고 관리
```javascript
{
  id: number,           // 메뉴 고유 ID
  name: string,         // 메뉴명 (예: "아메리카노(ICE)")
  description: string,  // 메뉴 설명
  price: number,       // 기본 가격 (원)
  image: string,       // 이미지 URL
  stock: number,       // 재고 수량
  isActive: boolean,   // 판매 여부
  createdAt: Date,     // 생성일시
  updatedAt: Date      // 수정일시
}
```

#### 6.1.2 Options (옵션)
**목적**: 메뉴별 추가 옵션 관리
```javascript
{
  id: number,          // 옵션 고유 ID
  menuId: number,      // 연결된 메뉴 ID
  name: string,        // 옵션명 (예: "샷 추가", "시럽 추가")
  price: number,       // 옵션 가격 (원)
  isActive: boolean,   // 옵션 활성화 여부
  createdAt: Date,     // 생성일시
  updatedAt: Date      // 수정일시
}
```

#### 6.1.3 Orders (주문)
**목적**: 주문 정보 및 상태 관리
```javascript
{
  id: number,          // 주문 고유 ID
  orderNumber: string,  // 주문번호 (예: "ORD-20240115-001")
  orderTime: Date,     // 주문 일시
  status: string,      // 주문 상태 ("주문 접수", "제조 중", "제조 완료")
  totalAmount: number, // 총 주문 금액
  items: [             // 주문 상품 목록
    {
      menuId: number,      // 메뉴 ID
      menuName: string,    // 메뉴명
      quantity: number,    // 수량
      basePrice: number,  // 기본 가격
      options: [          // 선택된 옵션들
        {
          optionId: number,
          optionName: string,
          optionPrice: number
        }
      ],
      itemTotal: number   // 상품별 총액
    }
  ],
  createdAt: Date,     // 생성일시
  updatedAt: Date      // 수정일시
}
```

### 6.2 사용자 흐름 및 데이터 처리

#### 6.2.1 메뉴 조회 흐름
1. **프론트엔드**: 메뉴 목록 조회 요청
2. **백엔드**: Menus 테이블에서 활성화된 메뉴 조회
3. **응답**: 메뉴 정보 (이름, 설명, 가격, 이미지) 반환
4. **관리자 화면**: 재고 수량 정보 추가 표시

#### 6.2.2 주문 처리 흐름
1. **사용자**: 메뉴 선택 및 옵션 설정
2. **장바구니**: 선택 정보 임시 저장
3. **주문 요청**: 주문 정보를 Orders 테이블에 저장
4. **재고 차감**: 주문 수량만큼 Menus.stock 감소
5. **응답**: 주문 완료 및 주문번호 반환

#### 6.2.3 주문 상태 관리 흐름
1. **관리자**: 주문 현황 조회
2. **상태 변경**: "주문 접수" → "제조 중" → "제조 완료"
3. **실시간 업데이트**: 상태 변경 시 프론트엔드 동기화

### 6.3 API 설계

#### 6.3.1 메뉴 관련 API

**GET /api/menus**
- **목적**: 활성화된 메뉴 목록 조회
- **응답**: 메뉴 정보 배열
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "시원한 아이스 아메리카노",
      "price": 4000,
      "image": "/images/americano-ice.jpg",
      "stock": 15
    }
  ]
}
```

**GET /api/menus/options/:menuId**
- **목적**: 특정 메뉴의 옵션 목록 조회
- **응답**: 옵션 정보 배열

#### 6.3.2 주문 관련 API

**POST /api/orders**
- **목적**: 새 주문 생성
- **요청 본문**:
```json
{
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "options": [
        {"optionId": 1, "quantity": 1}
      ]
    }
  ]
}
```
- **응답**:
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "orderNumber": "ORD-20240115-001",
    "totalAmount": 9000
  }
}
```

**GET /api/orders**
- **목적**: 주문 목록 조회 (관리자용)
- **쿼리 파라미터**: status, limit, offset
- **응답**: 주문 목록 배열

**PUT /api/orders/:orderId/status**
- **목적**: 주문 상태 변경
- **요청 본문**:
```json
{
  "status": "제조 중"
}
```

#### 6.3.3 재고 관리 API

**GET /api/inventory**
- **목적**: 재고 현황 조회 (관리자용)
- **응답**: 메뉴별 재고 정보

**PUT /api/inventory/:menuId**
- **목적**: 재고 수량 수정
- **요청 본문**:
```json
{
  "stock": 20
}
```

### 6.4 데이터베이스 스키마

#### 6.4.1 Menus 테이블
```sql
CREATE TABLE menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 6.4.2 Options 테이블
```sql
CREATE TABLE options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  menu_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);
```

#### 6.4.3 Orders 테이블
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('주문 접수', '제조 중', '제조 완료') DEFAULT '주문 접수',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 6.4.4 Order_Items 테이블
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  item_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);
```

#### 6.4.5 Order_Item_Options 테이블
```sql
CREATE TABLE order_item_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_item_id INT NOT NULL,
  option_id INT NOT NULL,
  option_name VARCHAR(50) NOT NULL,
  option_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id)
);
```

### 6.5 비즈니스 로직

#### 6.5.1 주문 생성 시 처리
1. **재고 확인**: 주문 수량이 재고보다 많은지 확인
2. **재고 차감**: 주문 확정 시 재고 수량 감소
3. **주문번호 생성**: "ORD-YYYYMMDD-XXX" 형식
4. **트랜잭션 처리**: 주문 생성과 재고 차감을 원자적으로 처리

#### 6.5.2 재고 관리
1. **재고 부족 알림**: 재고가 5개 이하일 때 경고
2. **품절 처리**: 재고가 0일 때 주문 불가
3. **재고 복구**: 관리자가 수동으로 재고 추가 가능

#### 6.5.3 주문 상태 관리
1. **상태 전환**: 주문 접수 → 제조 중 → 제조 완료
2. **역방향 처리**: 필요 시 이전 상태로 복구
3. **상태 로그**: 상태 변경 이력 추적

### 6.6 에러 처리

#### 6.6.1 일반적인 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "재고가 부족합니다",
    "details": {
      "menuId": 1,
      "requested": 5,
      "available": 3
    }
  }
}
```

#### 6.6.2 에러 코드 정의
- `INSUFFICIENT_STOCK`: 재고 부족
- `MENU_NOT_FOUND`: 메뉴를 찾을 수 없음
- `ORDER_NOT_FOUND`: 주문을 찾을 수 없음
- `INVALID_STATUS`: 잘못된 상태 변경
- `VALIDATION_ERROR`: 입력값 검증 실패

### 6.7 성능 최적화

#### 6.7.1 데이터베이스 인덱스
- `menus.is_active` 인덱스
- `orders.status` 인덱스
- `orders.order_time` 인덱스
- `order_items.order_id` 인덱스

#### 6.7.2 캐싱 전략
- 메뉴 목록: Redis 캐시 (5분)
- 재고 정보: 실시간 업데이트
- 주문 통계: 1분 캐시

### 6.8 보안 고려사항

#### 6.8.1 입력값 검증
- 주문 수량: 양수, 최대값 제한
- 가격: 음수 방지, 소수점 처리
- 메뉴 ID: 존재 여부 확인

#### 6.8.2 API 보안
- Rate Limiting: IP별 요청 제한
- CORS 설정: 허용된 도메인만 접근
- SQL Injection 방지: Prepared Statement 사용