const collaboratorsRepository = require('../models/collaboratorsRepository');

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
};