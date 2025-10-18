const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')

// GET /api/inventory - 재고 현황 조회 (관리자용)
router.get('/', inventoryController.getInventory)

// PUT /api/inventory/:menuId - 재고 수량 수정
router.put('/:menuId', inventoryController.updateInventory)

module.exports = router
