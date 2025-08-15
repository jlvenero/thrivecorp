// backend/routes/providers.js
const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providersController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/providers', authenticateToken, providersController.registerProvider);
router.get('/providers', authenticateToken, providersController.listProviders);
router.get('/providers/:id', authenticateToken, providersController.getProvider);
router.put('/providers/:id', authenticateToken, providersController.updateProvider);
router.delete('/providers/:id', authenticateToken, providersController.deleteProvider);

router.post('/gyms', authenticateToken, providersController.registerGym);
router.get('/gyms', authenticateToken, providersController.listGyms);
router.get('/gyms/:id', authenticateToken, providersController.getGym);
router.put('/gyms/:id', authenticateToken, providersController.updateGym);
router.delete('/gyms/:id', authenticateToken, providersController.deleteGym);

module.exports = router;