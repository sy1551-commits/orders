const { db } = require('../config/database')

class Order {
  // 주문 목록 조회
  static async findAll({ status, limit = 50, offset = 0 } = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT o.*, 
               GROUP_CONCAT(
                 oi.menu_name || ' x' || oi.quantity || 
                 CASE WHEN oio.option_name IS NOT NULL 
                   THEN ' (' || oio.option_name || ')' 
                   ELSE '' 
                 END, ', '
               ) as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN order_item_options oio ON oi.id = oio.order_item_id
      `
      
      const params = []
      const conditions = []
      
      if (status) {
        conditions.push('o.status = ?')
        params.push(status)
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      
      query += `
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `
      params.push(limit, offset)
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // ID로 주문 조회
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM orders WHERE id = ?',
        [id],
        (err, order) => {
          if (err) {
            reject(err)
          } else if (!order) {
            resolve(null)
          } else {
            // 주문 항목과 옵션 조회
            db.all(`
              SELECT oi.*, 
                     GROUP_CONCAT(
                       oio.option_name || ' (+' || oio.option_price || '원)',
                       ', '
                     ) as options
              FROM order_items oi
              LEFT JOIN order_item_options oio ON oi.id = oio.order_item_id
              WHERE oi.order_id = ?
              GROUP BY oi.id
            `, [id], (err, items) => {
              if (err) {
                reject(err)
              } else {
                order.items = items
                resolve(order)
              }
            })
          }
        }
      )
    })
  }

  // 새 주문 생성
  static async create(orderItems) {
    return new Promise(async (resolve, reject) => {
      try {
        const Menu = require('./Menu')
        
        // 재고 확인 및 차감
        for (const item of orderItems) {
          const menu = await Menu.findById(item.menuId)
          if (!menu) {
            throw new Error('MENU_NOT_FOUND')
          }
          
          if (menu.stock < item.quantity) {
            const error = new Error('INSUFFICIENT_STOCK')
            error.code = 'INSUFFICIENT_STOCK'
            error.details = {
              menuId: item.menuId,
              requested: item.quantity,
              available: menu.stock
            }
            throw error
          }
          
          await Menu.decreaseStock(item.menuId, item.quantity)
        }

        // 주문번호 생성
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
        
        // 다음 주문 ID 조회
        const nextId = await new Promise((resolve, reject) => {
          db.get('SELECT MAX(id) as maxId FROM orders', (err, row) => {
            if (err) reject(err)
            else resolve((row.maxId || 0) + 1)
          })
        })
        
        const orderNumber = `ORD-${dateStr}-${String(nextId).padStart(3, '0')}`

        // 주문 총액 계산
        let totalAmount = 0
        const processedItems = []

        for (const item of orderItems) {
          const menu = await Menu.findById(item.menuId)
          const options = item.options || []
          
          let itemTotal = menu.price * item.quantity
          const processedOptions = []
          
          for (const option of options) {
            const optionData = await Menu.getOptions(item.menuId)
            const selectedOption = optionData.find(opt => opt.id === option.optionId)
            if (selectedOption) {
              itemTotal += selectedOption.price * item.quantity
              processedOptions.push({
                optionId: selectedOption.id,
                optionName: selectedOption.name,
                optionPrice: selectedOption.price
              })
            }
          }
          
          totalAmount += itemTotal
          
          processedItems.push({
            menuId: item.menuId,
            menuName: menu.name,
            quantity: item.quantity,
            basePrice: menu.price,
            options: processedOptions,
            itemTotal: itemTotal
          })
        }

        // 주문 생성
        db.run(`
          INSERT INTO orders (order_number, total_amount)
          VALUES (?, ?)
        `, [orderNumber, totalAmount], function(err) {
          if (err) {
            reject(err)
          } else {
            const orderId = this.lastID
            
            // 주문 항목 저장
            const insertItem = db.prepare(`
              INSERT INTO order_items (order_id, menu_id, menu_name, quantity, base_price, item_total)
              VALUES (?, ?, ?, ?, ?, ?)
            `)
            
            const insertOption = db.prepare(`
              INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
              VALUES (?, ?, ?, ?)
            `)
            
            processedItems.forEach(async (item) => {
              insertItem.run([orderId, item.menuId, item.menuName, item.quantity, item.basePrice, item.itemTotal], function(err) {
                if (!err && item.options.length > 0) {
                  const itemId = this.lastID
                  item.options.forEach(option => {
                    insertOption.run([itemId, option.optionId, option.optionName, option.optionPrice])
                  })
                }
              })
            })
            
            insertItem.finalize()
            insertOption.finalize()
            
            const newOrder = {
              id: orderId,
              orderNumber,
              orderTime: new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\./g, '-').replace(/,/g, ''),
              status: '주문 접수',
              totalAmount,
              items: processedItems
            }
            
            resolve(newOrder)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // 주문 상태 업데이트
  static async updateStatus(orderId, newStatus) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['주문 접수', '제조 중', '제조 완료']
      if (!validStatuses.includes(newStatus)) {
        reject(new Error('INVALID_STATUS'))
        return
      }

      db.run(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, orderId],
        function(err) {
          if (err) {
            reject(err)
          } else if (this.changes === 0) {
            resolve(null)
          } else {
            db.get(
              'SELECT * FROM orders WHERE id = ?',
              [orderId],
              (err, row) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(row)
                }
              }
            )
          }
        }
      )
    })
  }
}

module.exports = Order
