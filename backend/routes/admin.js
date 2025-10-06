const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');

// Rota protegida que só pode ser acessada por um 'thrive_admin'
router.post('/admins', authenticateToken, authorize('thrive_admin'), adminController.createThriveAdmin);

module.exports = router;