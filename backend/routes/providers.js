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
        const provider = await providersRepository.getProviderByUserId(req.user.userId);
        if (!provider) {
            return res.status(404).json({ message: 'Prestador não encontrado para este usuário.' });
        }
        req.provider = provider;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro de servidor ao buscar detalhes do prestador.' });
    }
}

// Rotas para gerenciar prestadores de serviço (providers)
router.post('/providers', authenticateToken, providersController.registerProvider);
router.get('/providers', authenticateToken, providersController.listProviders);
router.get('/providers/:id', authenticateToken, providersController.getProvider);
router.put('/providers/:id', authenticateToken, providersController.updateProvider);
router.delete('/providers/:id', authenticateToken, providersController.deleteProvider);

// Rotas para gerenciar academias (gyms)
router.post('/provider/gyms', authenticateToken, getProviderDetails, providersController.addOwnGym);
router.post('/gyms', authenticateToken, providersController.registerGym);

// ROTA PARA O DASHBOARD DO COLABORADOR (CORREÇÃO)
router.get('/collaborator/gyms', authenticateToken, providersController.listGyms);

// Rotas de visualização de academias para diferentes perfis
router.get('/gyms/all', authenticateToken, authorize('thrive_admin'), providersController.listAllGymsForAdmin);
router.get('/gyms', authenticateToken, getProviderDetails, providersController.listProviderGyms);

// Rotas de gerenciamento de academias individuais
router.get('/gyms/:id', authenticateToken, providersController.getGym);
router.put('/gyms/:id', authenticateToken, providersController.updateGym);
router.delete('/gyms/:id', authenticateToken, checkGymDeletePermission, providersController.deleteGym);
router.put('/gyms/:id/approve', authenticateToken, authorize('thrive_admin'), providersController.approveGym);
router.delete('/gyms/:id/reprove', authenticateToken, authorize('thrive_admin'), providersController.reproveGym);


module.exports = router;