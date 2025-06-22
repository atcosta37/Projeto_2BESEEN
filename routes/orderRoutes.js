const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/auth');
// ===== ROTAS DE PEDIDOS =====

router.get('/minhas', authenticateToken, orderController.listUserOrders);



module.exports = router;