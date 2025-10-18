const { db } = require('../config/database')

class Menu {
  // 모든 활성화된 메뉴 조회
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM menus WHERE is_active = 1 ORDER BY id',
        (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        }
      )
    })
  }

  // 특정 메뉴의 옵션 조회
  static async getOptions(menuId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM options WHERE menu_id = ? AND is_active = 1',
        [menuId],
        (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        }
      )
    })
  }

  // 재고 현황 조회
  static async getInventory() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, stock FROM menus WHERE is_active = 1',
        (err, rows) => {
          if (err) {
            reject(err)
          } else {
            const inventory = rows.map(menu => ({
              id: menu.id,
              name: menu.name,
              stock: menu.stock,
              status: menu.stock === 0 ? '품절' : menu.stock < 5 ? '주의' : '정상'
            }))
            resolve(inventory)
          }
        }
      )
    })
  }

  // 재고 수량 업데이트
  static async updateStock(menuId, newStock) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE menus SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStock, menuId],
        function(err) {
          if (err) {
            reject(err)
          } else if (this.changes === 0) {
            resolve(null)
          } else {
            db.get(
              'SELECT * FROM menus WHERE id = ?',
              [menuId],
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

  // ID로 메뉴 조회
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM menus WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err)
          } else {
            resolve(row)
          }
        }
      )
    })
  }

  // 재고 차감
  static async decreaseStock(menuId, quantity) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT stock FROM menus WHERE id = ?',
        [menuId],
        (err, row) => {
          if (err) {
            reject(err)
          } else if (!row) {
            reject(new Error('MENU_NOT_FOUND'))
          } else if (row.stock < quantity) {
            reject(new Error('INSUFFICIENT_STOCK'))
          } else {
            db.run(
              'UPDATE menus SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [quantity, menuId],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          }
        }
      )
    })
  }
}

module.exports = Menu
