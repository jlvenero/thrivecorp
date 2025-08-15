const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providersController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware')
const checkGymDeletePermission = require('../middlewares/permissionMiddleware');

router.post('/providers', authenticateToken, providersController.registerProvider);
router.get('/providers', authenticateToken, providersController.listProviders);
router.get('/providers/:id', authenticateToken, providersController.getProvider);
router.put('/providers/:id', authenticateToken, providersController.updateProvider);
router.delete('/providers/:id', authenticateToken, providersController.deleteProvider);

router.post('/gyms', authenticateToken, providersController.registerGym);
router.get('/gyms', authenticateToken, providersController.listGyms);
router.get('/gyms/:id', authenticateToken, providersController.getGym);
router.put('/gyms/:id', authenticateToken, providersController.updateGym);
router.delete('/gyms/:id', authenticateToken, checkGymDeletePermission, providersController.deleteGym);
router.put('/gyms/:id/approve', authenticateToken, authorize('thrive_admin'), providersController.approveGym);

module.exports = router;