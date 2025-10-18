const express = require('express')
const router = express.Router()
const menuController = require('../controllers/menuController')

// GET /api/menus - 메뉴 목록 조회
router.get('/', menuController.getMenus)

// GET /api/menus/options/:menuId - 특정 메뉴의 옵션 조회
router.get('/options/:menuId', menuController.getMenuOptions)

module.exports = router
