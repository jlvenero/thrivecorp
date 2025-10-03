const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');


router.post('/login', authController.login);
router.post('/register', authController.submitRegistrationRequest);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;