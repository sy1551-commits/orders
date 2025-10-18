const Menu = require('../models/Menu')

// 메뉴 목록 조회
const getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll()
    res.json({
      success: true,
      data: menus
    })
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'MENU_FETCH_ERROR',
        message: '메뉴 조회 중 오류가 발생했습니다'
      }
    })
  }
}

// 특정 메뉴의 옵션 조회
const getMenuOptions = async (req, res) => {
  try {
    const { menuId } = req.params
    const options = await Menu.getOptions(menuId)
    
    res.json({
      success: true,
      data: options
    })
  } catch (error) {
    console.error('메뉴 옵션 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'OPTIONS_FETCH_ERROR',
        message: '메뉴 옵션 조회 중 오류가 발생했습니다'
      }
    })
  }
}

module.exports = {
  getMenus,
  getMenuOptions
}
