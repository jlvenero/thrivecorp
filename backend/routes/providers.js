// backend/routes/providers.js
const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providersController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');
const checkGymDeletePermission = require('../middlewares/permissionMiddleware');
const providersRepository = require('../models/providersRepository');

// Middleware para encontrar o ID do prestador a partir do user_id do token
async function getProviderDetails(req, res, next) {
    try {
        console.log('Middleware getProviderDetails: user_id do token:', req.user.userId);
        const provider = await providersRepository.getProviderByUserId(req.user.userId);
        if (!provider) {
            console.log('Prestador não encontrado para user_id:', req.user.userId);
            return res.status(404).json({ message: 'Prestador não encontrado para este usuário.' });
        }
        req.provider = provider;
        console.log('Middleware getProviderDetails: req.provider injetado:', req.provider);
        next();
    } catch (error) {
        console.error('Erro no middleware getProviderDetails:', error);
        res.status(500).json({ error: 'Erro de servidor ao buscar detalhes do prestador.' });
    }
}

router.post('/providers', authenticateToken, providersController.registerProvider);
router.get('/providers', authenticateToken, providersController.listProviders);
router.get('/providers/:id', authenticateToken, providersController.getProvider);
router.put('/providers/:id', authenticateToken, providersController.updateProvider);
router.delete('/providers/:id', authenticateToken, providersController.deleteProvider);

router.get('/gyms/all', authenticateToken, authorize('thrive_admin'), providersController.listGyms);

router.post('/gyms', authenticateToken, providersController.registerGym);
router.get('/gyms', authenticateToken, getProviderDetails, providersController.listProviderGyms);
router.get('/gyms/:id', authenticateToken, providersController.getGym);
router.put('/gyms/:id', authenticateToken, providersController.updateGym);
router.delete('/gyms/:id', authenticateToken, checkGymDeletePermission, providersController.deleteGym);
router.put('/gyms/:id/approve', authenticateToken, authorize('thrive_admin'), providersController.approveGym);
router.delete('/gyms/:id/reprove', authenticateToken, authorize('thrive_admin'), providersController.reproveGym);

module.exports = router;