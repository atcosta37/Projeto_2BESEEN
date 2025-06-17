const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/auth');

router.get('/api/admin/encomendas', authenticateToken, adminController.listOrdersAdmin);

router.delete('/api/admin/encomendas/:id', authenticateToken, adminController.deleteOrdersAdmin);

router.put('/api/admin/encomendas/:id', authenticateToken, adminController.updateOrdersAdmin);

router.get('/api/admin/mensagens', authenticateToken, adminController.mensagemAdmin);

module.exports = router;