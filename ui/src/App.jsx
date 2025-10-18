import { useState, useCallback } from 'react'
import './App.css'

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
      image: './iced-coffee-7113043_1920.jpg',
      description: '시원한 아이스 아메리카노'
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      image: 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      description: '따뜻한 핫 아메리카노'
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
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

  // 관리자 화면을 위한 함수들
  const updateInventory = (id, change) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { ...item, stock: Math.max(0, item.stock + change) }
        : item
    ))
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ))
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
  const handleOrder = () => {
    if (cart.length === 0) return

    // 재고 확인 및 차감
    const updatedInventory = [...inventory]
    let canOrder = true
    let outOfStockItems = []

    for (const cartItem of cart) {
      const inventoryItem = updatedInventory.find(inv => inv.id === cartItem.productId)
      if (inventoryItem) {
        if (inventoryItem.stock < cartItem.quantity) {
          canOrder = false
          outOfStockItems.push(cartItem.name)
        } else {
          inventoryItem.stock -= cartItem.quantity
        }
      }
    }

    if (!canOrder) {
      alert(`재고가 부족합니다: ${outOfStockItems.join(', ')}`)
      return
    }

    const newOrder = {
      id: Date.now(),
      orderTime: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, '-').replace(/,/g, ''),
      items: cart.map(item => ({
        name: item.name + (item.options.shot ? ' (샷 추가)' : '') + (item.options.syrup ? ' (시럽 추가)' : ''),
        quantity: item.quantity,
        price: item.basePrice
      })),
      totalAmount: getTotalPrice(),
      status: '주문 접수'
    }

    setOrders(prev => [newOrder, ...prev])
    setInventory(updatedInventory)
    setCart([])
    alert('주문이 접수되었습니다!')
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
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-info">
                      <div className="order-time">{order.orderTime}</div>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <span key={index}>
                            {item.name} x{item.quantity}
                            {index < order.items.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <div className="order-amount">{order.totalAmount.toLocaleString()}원</div>
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
                ))}
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
