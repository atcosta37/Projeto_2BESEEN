const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');

// ===== AUTENTICAÇÃO E REGISTO =====

// Login do utilizador
router.post('/login', userController.login);

// Registo de novo utilizador
router.post('/register', userController.register);

// ===== PERFIL DO UTILIZADOR =====

// Obter perfil do utilizador autenticado
router.get('/minhas', authenticateToken, userController.getProfile);

// ===== RECUPERAÇÃO DE PASSWORD =====

// Enviar email para recuperação de password
router.post('/forgotPassword', userController.forgotPassword);

// Redefinir password com token
router.post('/resetPassword', userController.resetPassword);

// Exporta o router para ser usado no servidor principal
module.exports = router;