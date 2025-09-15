const express = require('express');
const router = express.Router();
const collaboratorsController = require('../controllers/collaboratorsController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');

function checkCompanyAdminPermission(req, res, next) {
    const userRole = req.user.role;
    const { companyId } = req.params;

    if (userRole === 'company_admin') {
        // Lógica de verificação de propriedade no futuro:
        // const adminCompany = await getCompanyByAdminId(req.user.userId);
        // if (adminCompany.id === companyId) { return next(); }
        // Por enquanto, vamos assumir que o admin só pode acessar sua própria empresa
        return next();
    }
    
    return res.status(403).json({ message: 'Acesso negado. Apenas o administrador da empresa pode acessar.' });
}

// Rota para listar os colaboradores de uma empresa
router.post('/:companyId/collaborators', authenticateToken, checkCompanyAdminPermission, collaboratorsController.addCollaborator);
router.get('/:companyId/collaborators', authenticateToken, checkCompanyAdminPermission, collaboratorsController.getCollaborators);

module.exports = router;