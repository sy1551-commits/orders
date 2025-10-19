const { db } = require('../config/database')
const Menu = require('./Menu')

class Order {
  // 주문 목록 조회
  static async findAll({ status, limit = 50, offset = 0 } = {}) {
    try {
      let query = `
        SELECT 
          o.id, 
          o.order_number, 
          o.total_amount, 
          o.status, 
          o.created_at as order_time,
          STRING_AGG(
            DISTINCT oi.menu_name || ' x' || oi.quantity,
            ', '
          ) as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `
      
      const params = []
      const conditions = []
      
      if (status) {
        conditions.push('o.status = $' + (params.length + 1))
        params.push(status)
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      
      query += `
        GROUP BY o.id, o.order_number, o.total_amount, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      params.push(limit, offset)
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      throw error
    }
  }

  // ID로 주문 조회
  static async findById(id) {
    try {
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE id = $1',
        [id]
      )
      
      if (orderResult.rows.length === 0) {
        return null
      }
      
      const order = orderResult.rows[0]
      
      // 주문 항목 조회
      const itemsResult = await db.query(
        `SELECT oi.*, 
                COALESCE(
                  json_agg(
                    json_build_object('name', oio.option_name, 'price', oio.option_price)
                  ) FILTER (WHERE oio.id IS NOT NULL),
                  '[]'
                ) as options
         FROM order_items oi
         LEFT JOIN order_item_options oio ON oi.id = oio.order_item_id
         WHERE oi.order_id = $1
         GROUP BY oi.id`,
        [id]
      )
      
      order.items = itemsResult.rows
      return order
    } catch (error) {
      throw error
    }
  }

  // 주문 생성
  static async create(orderItems) {
    const client = await db.connect()
    
    try {
      await client.query('BEGIN')
      
      // 재고 확인 및 차감
      for (const item of orderItems) {
        const menu = await Menu.findById(item.menuId)
        
        if (!menu) {
          throw new Error('MENU_NOT_FOUND')
        }
        
        if (menu.stock < item.quantity) {
          throw new Error('INSUFFICIENT_STOCK')
        }
        
        // 재고 차감
        await client.query(
          'UPDATE menus SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.menuId]
        )
      }
      
      // 주문 번호 생성
      const orderNumber = 'ORD' + Date.now()
      
      // 총 금액 계산
      let totalAmount = 0
      for (const item of orderItems) {
        const menu = await Menu.findById(item.menuId)
        totalAmount += menu.price * item.quantity
        
        if (item.options) {
          for (const option of item.options) {
            totalAmount += option.price * item.quantity
          }
        }
      }
      
      // 주문 생성
      const orderResult = await client.query(
        'INSERT INTO orders (order_number, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
        [orderNumber, totalAmount, '주문 접수']
      )
      
      const order = orderResult.rows[0]
      
      // 주문 항목 생성
      for (const item of orderItems) {
        const menu = await Menu.findById(item.menuId)
        
        // 항목별 총 금액 계산 (메뉴 가격 + 옵션 가격)
        let itemTotal = menu.price * item.quantity
        if (item.options && item.options.length > 0) {
          for (const option of item.options) {
            itemTotal += option.price * item.quantity
          }
        }
        
        const itemResult = await client.query(
          'INSERT INTO order_items (order_id, menu_id, menu_name, quantity, base_price, item_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [order.id, item.menuId, menu.name, item.quantity, menu.price, itemTotal]
        )
        
        const orderItem = itemResult.rows[0]
        
        // 옵션 추가
        if (item.options && item.options.length > 0) {
          for (const option of item.options) {
            // 옵션 ID가 없으면 옵션 이름으로 조회
            let optionId = option.id
            if (!optionId) {
              const optionResult = await client.query(
                'SELECT id FROM options WHERE menu_id = $1 AND name = $2 LIMIT 1',
                [item.menuId, option.name]
              )
              optionId = optionResult.rows[0]?.id || null
            }
            
            // option_id가 있을 때만 삽입
            if (optionId) {
              await client.query(
                'INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price) VALUES ($1, $2, $3, $4)',
                [orderItem.id, optionId, option.name, option.price]
              )
            }
          }
        }
      }
      
      await client.query('COMMIT')
      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // 주문 상태 업데이트
  static async updateStatus(orderId, newStatus) {
    try {
      const result = await db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newStatus, orderId]
      )
      return result.rows[0] || null
    } catch (error) {
      throw error
    }
  }
}

module.exports = Order
