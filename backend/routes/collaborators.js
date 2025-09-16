const express = require('express');
const router = express.Router();
const collaboratorsController = require('../controllers/collaboratorsController');
const authenticateToken = require('../middlewares/authMiddleware');
const companiesRepository = require('../models/companiesRepository');

// Middleware aprimorado para verificar permissão e identificar a empresa
async function checkCompanyAdminPermission(req, res, next) {
    const userRole = req.user.role;
    const adminId = req.user.userId;

    if (userRole !== 'company_admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores de empresa podem realizar esta ação.' });
    }
    
    try {
        const company = await companiesRepository.getCompanyByAdminId(adminId);
        if (!company) {
            return res.status(404).json({ message: 'Nenhuma empresa associada a este administrador.' });
        }
        // Injeta o ID da empresa na requisição para ser usado no controller
        req.companyId = company.id;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar permissões da empresa.' });
    }
}

// Rotas refatoradas (sem :companyId na URL)
router.post('/collaborators', authenticateToken, checkCompanyAdminPermission, collaboratorsController.addCollaborator);
router.get('/collaborators', authenticateToken, checkCompanyAdminPermission, collaboratorsController.getCollaborators);
router.put('/collaborators/:collaboratorId/deactivate', authenticateToken, checkCompanyAdminPermission, collaboratorsController.deactivateCollaborator);

module.exports = router;