const providersRepository = require('../models/providersRepository');

async function getProviderDetails(req, res, next) {
    try {
        const provider = await providersRepository.getProviderByUserId(req.user.userId);
        if (!provider) {
            return res.status(404).json({ message: 'Prestador de serviço não encontrado para este usuário.' });
        }
        req.provider = provider;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro de servidor ao buscar detalhes do prestador.' });
    }
}

module.exports = getProviderDetails;