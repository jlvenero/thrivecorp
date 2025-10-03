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

async function getMonthlyBillingReport(req, res) {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const report = await accessRepository.getMonthlyBillingReport(year, month);
        res.status(200).json(report);
    } catch (error) {
        console.error('Erro ao buscar relatório de faturamento mensal:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de faturamento.' });
    }
}

async function getCompanyAccessDetails(req, res) {
    const { companyId } = req; // Injetado pelo middleware getCompanyDetails
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const report = await accessRepository.getCompanyAccessDetails(companyId, year, month);
        res.status(200).json(report);
    } catch (error) {
        console.error('Erro ao buscar relatório detalhado da empresa:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório detalhado.' });
    }
}

module.exports = {
    recordAccess,
    getProviderAccessReport,
    getCompanyAccessReport,
    getMonthlyBillingReport,
    getCompanyAccessDetails
};