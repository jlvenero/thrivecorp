const collaboratorsRepository = require('../models/collaboratorsRepository');

async function addCollaborator(req, res) {
    const { companyId } = req.params;
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
    const { companyId } = req.params;
    console.log('Controlador recebeu companyId:', companyId); // Log para ver o ID
    try {
        const collaborators = await collaboratorsRepository.getCollaboratorsByCompanyId(companyId);
        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        res.status(500).json({ error: 'Erro ao buscar a lista de colaboradores.' });
    }
}


module.exports = {
    getCollaborators,
    addCollaborator
};