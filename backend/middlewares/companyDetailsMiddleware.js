const companiesRepository = require('../models/companiesRepository');

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

module.exports = getCompanyDetails;