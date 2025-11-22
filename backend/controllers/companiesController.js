const companiesRepository = require('../models/companiesRepository');
const logger = require('../utils/logger'); // <--- Importação OBRIGATÓRIA

async function createCompany(req, res) {
    const companyData = req.body;
    try {
        const newCompanyId = await companiesRepository.createCompany(companyData);
        
        // Log de Sucesso
        logger.info('Solicitação de registro de empresa criada', {
            action: 'company_create_request',
            companyName: companyData.name
        });

        res.status(201).json({
            message: 'Empresa solicitada para registro com sucesso!',
            id: newCompanyId
        });
    } catch (error) {
        logger.error('Erro ao solicitar registro da empresa', {
            action: 'company_create_error',
            error: error.message,
            stack: error.stack,
            data: companyData
        });

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
        logger.error('Erro ao buscar a empresa', {
            action: 'company_get_error',
            companyId: id,
            error: error.message
        });

        res.status(500).json({ error: 'Erro ao buscar a empresa.' });
    }
}

async function getAllCompanies(req, res) {
    // Filtros opcionais via query params
    const filters = req.query; 
    try {
        const companies = await companiesRepository.getAllCompanies(filters);
        res.status(200).json(companies);
    } catch (error) {
        logger.error('Erro ao buscar a lista de empresas', {
            action: 'company_list_error',
            filters,
            error: error.message
        });

        res.status(500).json({ error: 'Erro ao buscar a lista de empresas.' });
    }
}

async function deleteCompany(req, res) {
    const { id } = req.params;
    try {
        const success = await companiesRepository.deleteCompany(id);
        if (success) {
            logger.info('Empresa deletada com sucesso', {
                action: 'company_delete',
                companyId: id,
                adminId: req.user ? req.user.userId : 'system'
            });
            res.status(200).json({ message: 'Empresa e usuário associado deletados com sucesso.' });
        } else {
            res.status(404).json({ message: 'Empresa não encontrada para exclusão.' });
        }
    } catch (error) {
        logger.error('Erro ao excluir a empresa', {
            action: 'company_delete_error',
            companyId: id,
            error: error.message
        });

        res.status(500).json({ error: 'Erro ao excluir a empresa.' });
    }
}

async function approveCompany(req, res) {
    const { id } = req.params;
    try {
        const success = await companiesRepository.approveCompany(id);
        
        if (success) {
            logger.info('Empresa aprovada com sucesso', {
                action: 'company_approval',
                companyId: id,
                adminId: req.user ? req.user.userId : 'unknown'
            });

            res.status(200).json({ message: 'Empresa e usuário associado aprovados com sucesso.' });
        } else {
            res.status(404).json({ message: 'Empresa não encontrada para aprovação.' });
        }
    } catch (error) {
        logger.error('Erro ao aprovar a empresa', {
            action: 'company_approval_error',
            companyId: id,
            error: error.message,
            stack: error.stack
        });

        res.status(500).json({ error: 'Erro ao aprovar a empresa.' });
    }
}

module.exports = {
    createCompany,
    getCompany,
    getAllCompanies,
    deleteCompany,
    approveCompany
};