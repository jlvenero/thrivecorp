const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const accessController = require('../controllers/accessController');
const providersRepository = require('../models/providersRepository');
const companiesRepository = require('../models/companiesRepository');

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

// Middleware para encontrar o ID da empresa a partir do admin_id do token
async function getCompanyDetails(req, res, next) {
    try {
        const company = await companiesRepository.getCompanyByAdminId(req.user.userId);
        if (!company) {
            return res.status(404).json({ message: 'Empresa não encontrada para este usuário.' });
        }
        req.companyId = company.id;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro de servidor ao buscar detalhes da empresa.' });
    }
}

// Rota para o colaborador fazer check-in
router.post('/', authenticateToken, accessController.recordAccess);

// Rota para o prestador de serviço ver seu relatório
router.get('/provider-report', authenticateToken, getProviderDetails, accessController.getProviderAccessReport);

// Rota para o admin da empresa ver seu relatório
router.get('/company-report', authenticateToken, getCompanyDetails, accessController.getCompanyAccessReport);

module.exports = router;