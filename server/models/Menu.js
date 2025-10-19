const { db } = require('../config/database')

class Menu {
  // 모든 활성화된 메뉴 조회
  static async findAll() {
    try {
      const result = await db.query(
        'SELECT * FROM menus WHERE is_active = true ORDER BY id'
      )
      return result.rows
    } catch (error) {
      throw error
    }
  }

  // 특정 메뉴의 옵션 조회
  static async getOptions(menuId) {
    try {
      const result = await db.query(
        'SELECT * FROM options WHERE menu_id = $1 AND is_active = true',
        [menuId]
      )
      return result.rows
    } catch (error) {
      throw error
    }
  }

  // 재고 현황 조회
  static async getInventory() {
    try {
      const result = await db.query(
        'SELECT id, name, stock FROM menus WHERE is_active = true'
      )
      const inventory = result.rows.map(menu => ({
        id: menu.id,
        name: menu.name,
        stock: menu.stock,
        status: menu.stock === 0 ? '품절' : menu.stock < 5 ? '주의' : '정상'
      }))
      return inventory
    } catch (error) {
      throw error
    }
  }

  // 재고 수량 업데이트
  static async updateStock(menuId, newStock) {
    try {
      const result = await db.query(
        'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newStock, menuId]
      )
      return result.rows[0] || null
    } catch (error) {
      throw error
    }
  }

  // ID로 메뉴 조회
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM menus WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } catch (error) {
      throw error
    }
  }

  // 재고 차감
  static async decreaseStock(menuId, quantity) {
    try {
      // 현재 재고 확인
      const menu = await this.findById(menuId)
      
      if (!menu) {
        throw new Error('MENU_NOT_FOUND')
      }
      
      if (menu.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK')
      }
      
      // 재고 차감
      await db.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, menuId]
      )
      
      return true
    } catch (error) {
      throw error
    }
  }
}

module.exports = Menu
