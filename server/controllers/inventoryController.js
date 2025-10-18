const Menu = require('../models/Menu')

// 재고 현황 조회 (관리자용)
const getInventory = async (req, res) => {
  try {
    const inventory = await Menu.getInventory()
    
    res.json({
      success: true,
      data: inventory
    })
  } catch (error) {
    console.error('재고 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_FETCH_ERROR',
        message: '재고 조회 중 오류가 발생했습니다'
      }
    })
  }
}

// 재고 수량 수정
const updateInventory = async (req, res) => {
  try {
    const { menuId } = req.params
    const { stock } = req.body
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '유효한 재고 수량을 입력해주세요'
        }
      })
    }
    
    const menu = await Menu.updateStock(menuId, stock)
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다'
        }
      })
    }
    
    res.json({
      success: true,
      data: menu
    })
  } catch (error) {
    console.error('재고 수정 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_UPDATE_ERROR',
        message: '재고 수정 중 오류가 발생했습니다'
      }
    })
  }
}

module.exports = {
  getInventory,
  updateInventory
}
