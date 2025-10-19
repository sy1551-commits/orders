import { useState, useCallback, useEffect } from 'react'
import './App.css'

// API 기본 URL (환경 변수 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function App() {
  const [activeTab, setActiveTab] = useState('order')
  const [cart, setCart] = useState([])
  
  // 관리자 화면을 위한 상태
  const [inventory, setInventory] = useState([
    { id: 1, name: '아메리카노(ICE)', stock: 15 },
    { id: 2, name: '아메리카노(HOT)', stock: 8 },
    { id: 3, name: '카페라떼', stock: 3 }
  ])
  
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderTime: '2024-01-15 14:30',
      items: [
        { name: '아메리카노(ICE)', quantity: 2, price: 4000 },
        { name: '카페라떼', quantity: 1, price: 5000 }
      ],
      totalAmount: 13000,
      status: '주문 접수'
    },
    {
      id: 2,
      orderTime: '2024-01-15 14:25',
      items: [
        { name: '아메리카노(HOT)', quantity: 1, price: 4000 }
      ],
      totalAmount: 4000,
      status: '제조 중'
    }
  ])

  // 커피 메뉴 데이터
  const menuItems = [
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      image: '/images/americano-ice.jpg',
      description: '시원한 아이스 아메리카노'
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      image: '/images/americano-hot.jpg',
      description: '따뜻한 핫 아메리카노'
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      image: '/images/cafe-latte.jpg',
      description: '부드러운 카페라떼'
    }
  ]

  // 장바구니에 상품 추가
  const addToCart = useCallback((item, options) => {
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.productId === item.id && 
      JSON.stringify(cartItem.options) === JSON.stringify(options)
    )

    if (existingItemIndex > -1) {
      // 같은 상품과 옵션이 있으면 수량만 증가
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      updatedCart[existingItemIndex].totalPrice = updatedCart[existingItemIndex].basePrice * updatedCart[existingItemIndex].quantity + 
        (updatedCart[existingItemIndex].options.shot ? 500 : 0) * updatedCart[existingItemIndex].quantity
      setCart(updatedCart)
    } else {
      // 새로운 상품 추가
      const cartItem = {
        id: Date.now(),
        productId: item.id,
        name: item.name,
        basePrice: item.price,
        options: options,
        quantity: 1,
        totalPrice: item.price + (options.shot ? 500 : 0) + (options.syrup ? 0 : 0)
      }
      setCart([...cart, cartItem])
    }
  }, [cart])

  // 장바구니에서 상품 제거
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // 수량 증가
  const increaseQuantity = (itemId) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + 1
        const newTotalPrice = item.basePrice * newQuantity + 
          (item.options.shot ? 500 : 0) * newQuantity
        return { ...item, quantity: newQuantity, totalPrice: newTotalPrice }
      }
      return item
    })
    setCart(updatedCart)
  }

  // 수량 감소
  const decreaseQuantity = (itemId) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        if (item.quantity > 1) {
          const newQuantity = item.quantity - 1
          const newTotalPrice = item.basePrice * newQuantity + 
            (item.options.shot ? 500 : 0) * newQuantity
          return { ...item, quantity: newQuantity, totalPrice: newTotalPrice }
        } else {
          return null // 수량이 1이면 제거
        }
      }
      return item
    }).filter(item => item !== null)
    setCart(updatedCart)
  }

  // 총 금액 계산
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  // 관리자 화면 활성화 시 재고 및 주문 데이터 로드
  useEffect(() => {
    const loadAdminData = async () => {
      if (activeTab === 'admin') {
        try {
          // 재고 데이터 로드
          const inventoryResponse = await fetch(`${API_BASE_URL}/inventory`)
          const inventoryData = await inventoryResponse.json()
          if (inventoryData.success) {
            setInventory(inventoryData.data)
          }

          // 주문 데이터 로드
          const ordersResponse = await fetch(`${API_BASE_URL}/orders`)
          const ordersData = await ordersResponse.json()
          if (ordersData.success) {
            setOrders(ordersData.data)
          }
        } catch (error) {
          console.error('데이터 로드 오류:', error)
        }
      }
    }
    loadAdminData()
  }, [activeTab])

  // 관리자 화면을 위한 함수들
  const updateInventory = async (id, change) => {
    try {
      const currentItem = inventory.find(item => item.id === id)
      if (!currentItem) return

      const newStock = Math.max(0, currentItem.stock + change)
      
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      
      const data = await response.json()
      if (data.success) {
        setInventory(prev => prev.map(item => 
          item.id === id 
            ? { ...item, stock: newStock }
            : item
        ))
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error)
      alert('재고 업데이트 중 오류가 발생했습니다.')
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      }
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error)
      alert('주문 상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ef4444' }
    if (stock < 5) return { text: '주의', color: '#f59e0b' }
    return { text: '정상', color: '#10b981' }
  }

  const getDashboardStats = () => {
    const totalOrders = orders.length
    const receivedOrders = orders.filter(order => order.status === '주문 접수').length
    const inProduction = orders.filter(order => order.status === '제조 중').length
    const completed = orders.filter(order => order.status === '제조 완료').length
    
    return { totalOrders, receivedOrders, inProduction, completed }
  }

  // 주문 처리 함수
  const handleOrder = async () => {
    if (cart.length === 0) return

    try {
      // API로 주문 생성 (옵션 ID를 메뉴 ID에 맞게 조정)
      const orderItems = cart.map(item => {
        const shotOptionId = item.productId * 2 - 1  // 1->1, 2->3, 3->5
        const syrupOptionId = item.productId * 2      // 1->2, 2->4, 3->6
        
        return {
          menuId: item.productId,
          quantity: item.quantity,
          options: [
            ...(item.options.shot ? [{ optionId: shotOptionId }] : []),
            ...(item.options.syrup ? [{ optionId: syrupOptionId }] : [])
          ]
        }
      })

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems })
      })

      const data = await response.json()

      if (data.success) {
        // 주문 성공 시 장바구니 비우기
        setCart([])
        alert('주문이 완료되었습니다!')
        
        // 관리자 화면이면 주문 목록과 재고 새로고침
        if (activeTab === 'admin') {
          // 재고 데이터 다시 로드
          const inventoryResponse = await fetch(`${API_BASE_URL}/inventory`)
          const inventoryData = await inventoryResponse.json()
          if (inventoryData.success) {
            setInventory(inventoryData.data)
          }
          
          // 주문 목록 다시 로드
          const ordersResponse = await fetch(`${API_BASE_URL}/orders`)
          const ordersData = await ordersResponse.json()
          if (ordersData.success) {
            setOrders(ordersData.data)
          }
        }
      } else {
        throw new Error(data.error?.message || '주문 처리 실패')
      }
    } catch (error) {
      console.error('주문 처리 오류:', error)
      if (error.message.includes('INSUFFICIENT_STOCK') || error.message.includes('재고')) {
        alert('재고가 부족합니다. 관리자에게 문의하세요.')
      } else {
        alert('주문 처리 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <div className="app">
      {/* 헤더 섹션 */}
      <header className="header">
        <div className="brand">먕이네</div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'order' ? 'active' : ''}`}
            onClick={() => setActiveTab('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            관리자
          </button>
        </div>
      </header>

      {/* 주문하기 화면 */}
      {activeTab === 'order' && (
        <div className="order-screen">
          {/* 메뉴 섹션 */}
          <div className="menu-section">
            <div className="menu-grid">
              {menuItems.map(item => (
                <MenuItem 
                  key={item.id} 
                  item={item} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>

          {/* 장바구니 섹션 */}
          <div className="cart-section">
            <h3>장바구니</h3>
            <div className="cart-content">
              {/* 주문 내역 */}
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">
                        {item.name} {(() => {
                          const options = [];
                          if (item.options.shot) options.push('(샷 추가)');
                          if (item.options.syrup) options.push('(시럽 추가)');
                          return options.length > 0 ? ' ' + options.join(', ') : '';
                        })()}
                      </span>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-actions">
                      <span className="item-price">{item.totalPrice.toLocaleString()}원</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 총 금액 및 주문 버튼 */}
              <div className="cart-summary">
                <div className="cart-total">
                  <span>총 금액 {getTotalPrice().toLocaleString()}원</span>
                </div>
        <button 
          className="order-btn" 
          disabled={cart.length === 0}
          onClick={handleOrder}
          aria-label="장바구니에 담긴 상품을 주문합니다"
        >
          주문하기
        </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 화면 */}
      {activeTab === 'admin' && (
        <div className="admin-screen">
          <div className="admin-container">
            {/* 관리자 대시보드 */}
            <div className="dashboard-section">
              <h2>관리자 대시보드</h2>
              <div className="dashboard-grid">
                {(() => {
                  const stats = getDashboardStats()
                  return [
                    { label: '총 주문', value: stats.totalOrders, color: '#3b82f6' },
                    { label: '주문 접수', value: stats.receivedOrders, color: '#f59e0b' },
                    { label: '제조 중', value: stats.inProduction, color: '#eab308' },
                    { label: '제조 완료', value: stats.completed, color: '#10b981' }
                  ].map((stat, index) => (
                    <div key={index} className="dashboard-card" style={{ backgroundColor: stat.color }}>
                      <div className="dashboard-label">{stat.label}</div>
                      <div className="dashboard-value">{stat.value}</div>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* 재고 현황 */}
            <div className="inventory-section">
              <h2>재고 현황</h2>
              <div className="inventory-grid">
                {inventory.map(item => {
                  const stockStatus = getStockStatus(item.stock)
                  return (
                    <div key={item.id} className="inventory-card">
                      <div className="inventory-info">
                        <h3>{item.name}</h3>
                        <div className="stock-info">
                          <span className="stock-count">{item.stock}개</span>
                          <span className="stock-status" style={{ color: stockStatus.color }}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                      <div className="inventory-controls">
                        <button 
                          className="stock-btn decrease" 
                          onClick={() => updateInventory(item.id, -1)}
                          disabled={item.stock === 0}
                        >
                          -
                        </button>
                        <button 
                          className="stock-btn increase" 
                          onClick={() => updateInventory(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 주문 현황 */}
            <div className="orders-section">
              <h2>주문 현황</h2>
              <div className="orders-list">
                {orders.map(order => {
                  // API 응답 데이터 형식 처리
                  const orderTime = order.order_time || order.orderTime
                  const displayTime = orderTime ? new Date(orderTime).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).replace(/\./g, '-').replace(/,/g, '') : ''
                  
                  const totalAmount = parseFloat(order.total_amount || order.totalAmount || 0)
                  const itemsSummary = order.items_summary || ''
                  const amount = Number(totalAmount) || 0
                  
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-info">
                        <div className="order-time">{displayTime}</div>
                        <div className="order-items">
                          {itemsSummary}
                        </div>
                        <div className="order-amount">{amount.toLocaleString()}원</div>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                        <div className="order-actions">
                          {order.status === '주문 접수' && (
                            <button 
                              className="status-btn" 
                              onClick={() => updateOrderStatus(order.id, '제조 중')}
                            >
                              제조 시작
                            </button>
                          )}
                          {order.status === '제조 중' && (
                            <button 
                              className="status-btn" 
                              onClick={() => updateOrderStatus(order.id, '제조 완료')}
                            >
                              제조 완료
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 메뉴 아이템 컴포넌트
function MenuItem({ item, onAddToCart }) {
  const [options, setOptions] = useState({
    shot: false,
    syrup: false
  })

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handleAddToCart = () => {
    onAddToCart(item, options)
  }

  const getTotalPrice = () => {
    return item.price + (options.shot ? 500 : 0) + (options.syrup ? 0 : 0)
  }

  return (
    <div className="menu-item">
      <div className="item-image">
        <img 
          src={item.image} 
          alt={item.name} 
          className="coffee-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDslYzsiqQ8L3RleHQ+PC9zdmc+'
          }}
        />
      </div>
      <div className="item-info">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-price">{item.price.toLocaleString()}원</p>
        <p className="item-description">{item.description}</p>
        
        <div className="options">
          <label className="option">
            <input 
              type="checkbox" 
              checked={options.shot}
              onChange={() => handleOptionChange('shot')}
            />
            샷 추가 (+500원)
          </label>
          <label className="option">
            <input 
              type="checkbox" 
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
            />
            시럽 추가 (+0원)
          </label>
        </div>
        
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  )
}

export default App
