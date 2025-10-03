const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const plansController = require('../controllers/plansController');
const getProviderDetails = require('../middlewares/providerDetailsMiddleware');

router.post('/', authenticateToken, getProviderDetails, plansController.createPlan);
router.get('/', authenticateToken, getProviderDetails, plansController.getMyPlans);

router.put('/:planId', authenticateToken, getProviderDetails, plansController.updatePlan);
router.delete('/:planId', authenticateToken, getProviderDetails, plansController.deletePlan);


module.exports = router;