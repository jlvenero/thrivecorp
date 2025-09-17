const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const plansController = require('../controllers/plansController');
const getProviderDetails = require('../middlewares/providerDetailsMiddleware');

router.post('/', authenticateToken, getProviderDetails, plansController.createPlan);
router.get('/', authenticateToken, getProviderDetails, plansController.getMyPlans);

module.exports = router;