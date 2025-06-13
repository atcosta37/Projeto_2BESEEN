const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');

router.post('/login', userController.login);
router.post('/register', userController.register);


router.get('/minhas', authenticateToken, userController.getProfile);

module.exports = router;