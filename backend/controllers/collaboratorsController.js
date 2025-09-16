const collaboratorsRepository = require('../models/collaboratorsRepository');

async function addCollaborator(req, res) {
    const { companyId } = req; 
    const { first_name, last_name, email, password } = req.body;
    try {
        const newCollaboratorId = await collaboratorsRepository.addCollaborator({ first_name, last_name, email, password }, companyId);
        res.status(201).json({ message: 'Colaborador adicionado com sucesso!', id: newCollaboratorId });
    } catch (error) {
        console.error("Erro ao adicionar colaborador:", error);
        res.status(500).json({ error: 'Erro ao adicionar o colaborador.' });
    }
}

async function getCollaborators(req, res) {
    const { companyId } = req; 
    try {
        const collaborators = await collaboratorsRepository.getCollaboratorsByCompanyId(companyId);
        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        res.status(500).json({ error: 'Erro ao buscar a lista de colaboradores.' });
    }
}

async function deactivateCollaborator(req, res) {
    const { collaboratorId } = req.params;
    try {
        const success = await collaboratorsRepository.deactivateCollaborator(collaboratorId);
        if (success) {
            res.status(200).json({ message: 'Colaborador desativado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Colaborador não encontrado.' });
        }
    } catch (error) {
        console.error("Erro ao desativar colaborador:", error);
        res.status(500).json({ error: 'Erro ao desativar o colaborador.' });
    }
}


module.exports = {
    getCollaborators,
    addCollaborator,
    deactivateCollaborator
};