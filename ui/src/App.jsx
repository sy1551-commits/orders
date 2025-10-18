import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('order')
  const [cart, setCart] = useState([])

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
  const addToCart = (item, options) => {
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
  }

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
                <button className="order-btn" disabled={cart.length === 0}>
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
          <h2>관리자 화면</h2>
          <p>관리자 기능은 추후 구현 예정입니다.</p>
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
        <img src={item.image} alt={item.name} className="coffee-image" />
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
