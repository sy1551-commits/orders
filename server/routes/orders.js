const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')

// GET /api/orders - 주문 목록 조회 (관리자용)
router.get('/', orderController.getOrders)

// POST /api/orders - 새 주문 생성
router.post('/', orderController.createOrder)

// GET /api/orders/:orderId - 특정 주문 조회
router.get('/:orderId', orderController.getOrderById)

// PUT /api/orders/:orderId/status - 주문 상태 변경
router.put('/:orderId/status', orderController.updateOrderStatus)

module.exports = router
