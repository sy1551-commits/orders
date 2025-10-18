const Order = require('../models/Order')

// 주문 목록 조회 (관리자용)
const getOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    const orders = await Order.findAll({ status, limit: parseInt(limit), offset: parseInt(offset) })
    
    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('주문 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_FETCH_ERROR',
        message: '주문 조회 중 오류가 발생했습니다'
      }
    })
  }
}

// 새 주문 생성
const createOrder = async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '주문 항목이 필요합니다'
        }
      })
    }

    const order = await Order.create(items)
    
    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount
      }
    })
  } catch (error) {
    console.error('주문 생성 오류:', error)
    
    if (error.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: '재고가 부족합니다',
          details: error.details
        }
      })
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_CREATE_ERROR',
        message: '주문 생성 중 오류가 발생했습니다'
      }
    })
  }
}

// 특정 주문 조회
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다'
        }
      })
    }
    
    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('주문 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_FETCH_ERROR',
        message: '주문 조회 중 오류가 발생했습니다'
      }
    })
  }
}

// 주문 상태 변경
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '상태값이 필요합니다'
        }
      })
    }
    
    const order = await Order.updateStatus(orderId, status)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다'
        }
      })
    }
    
    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('주문 상태 변경 오류:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_UPDATE_ERROR',
        message: '주문 상태 변경 중 오류가 발생했습니다'
      }
    })
  }
}

module.exports = {
  getOrders,
  createOrder,
  getOrderById,
  updateOrderStatus
}
