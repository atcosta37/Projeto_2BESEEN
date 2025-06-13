const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/auth');
console.log("orderRoutes carregado");
// Todas as rotas abaixo requerem autenticação
router.post('/criar', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.listOrders);
router.get('/minhas', authenticateToken, orderController.listUserOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);


module.exports = router;