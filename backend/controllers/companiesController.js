const companiesRepository = require('../models/companiesRepository');

async function createCompany(req, res) {
    const { name, cnpj, address, admin_id } = req.body;
    try {
        const newCompanyId = await companiesRepository.createCompany({ name, cnpj, address, admin_id });
        res.status(201).json({ message: 'Empresa solicitada para registro com sucesso!', id: newCompanyId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao solicitar registro da empresa.' });
    }
}

async function getCompany(req, res) {
    const { id } = req.params;
    try {
        const company = await companiesRepository.getCompanyById(id);
        if (company) {
            res.status(200).json(company);
        } else {
            res.status(404).json({ message: 'Empresa não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar a empresa.' });
    }
}

async function deleteCompany(req, res) {
    const { id } = req.params;
    try {
        const success = await companiesRepository.deleteCompany(id);
        if (success) {
            res.status(200).json({ message: 'Empresa e usuário associado deletados com sucesso.' });
        } else {
            res.status(404).json({ message: 'Empresa não encontrada para exclusão.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir a empresa.' });
    }
}

async function getAllCompanies(req, res) {
    try {
        const companies = await companiesRepository.getAllCompanies();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar a lista de empresas.' });
    }
}

async function approveCompany(req, res) {
    const { id } = req.params;
    try {
        const success = await companiesRepository.approveCompany(id);
        if (success) {
            res.status(200).json({ message: 'Empresa e usuário associado aprovados com sucesso.' });
        } else {
            res.status(404).json({ message: 'Empresa não encontrada para aprovação.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar a empresa.' });
    }
}

module.exports = {
    createCompany,
    getCompany,
    deleteCompany,
    getAllCompanies,
    approveCompany
};