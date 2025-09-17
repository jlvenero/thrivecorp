const accessRepository = require('../models/accessRepository');

async function recordAccess(req, res) {
    const userId = req.user.userId;
    const { gymId } = req.body;

    if (!gymId) {
        return res.status(400).json({ error: 'O ID da academia é obrigatório.' });
    }

    try {
        const newAccessId = await accessRepository.recordAccess(userId, gymId);
        res.status(201).json({ message: 'Acesso registrado com sucesso!', accessId: newAccessId });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        res.status(500).json({ error: 'Erro ao registrar o acesso.' });
    }
}

async function getProviderAccessReport(req, res) {
    const providerId = req.provider.id;
    try {
        const accesses = await accessRepository.getAccessesByProviderId(providerId);
        res.status(200).json(accesses);
    } catch (error) {
        console.error('Erro ao buscar relatório de acessos do prestador:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de acessos.' });
    }
}

async function getCompanyAccessReport(req, res) {
    const companyId = req.companyId;
    try {
        const accesses = await accessRepository.getAccessesByCompanyId(companyId);
        res.status(200).json(accesses);
    } catch (error) {
        console.error('Erro ao buscar relatório de acessos da empresa:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de acessos.' });
    }
}

module.exports = {
    recordAccess,
    getProviderAccessReport,
    getCompanyAccessReport
};