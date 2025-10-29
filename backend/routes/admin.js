const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');
const billingController = require('../controllers/billingController');

// Rota protegida que só pode ser acessada por um 'thrive_admin'
router.post('/admins', authenticateToken, authorize('thrive_admin'), adminController.createThriveAdmin);
router.post('/billing/mark-sent', authenticateToken, authorize('thrive_admin'), billingController.markAsSent);
router.post('/billing/status', authenticateToken, authorize('thrive_admin'), billingController.updateBillingStatus);

module.exports = router;