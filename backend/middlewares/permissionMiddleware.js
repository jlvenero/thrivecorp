const providersRepository = require('../models/providersRepository');
const logger = require('../utils/logger');

async function checkGymDeletePermission(req, res, next) {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        console.log(`Dados do Token: userId=${userId}, userRole=${userRole}`);
        
        const gym = await providersRepository.getGymById(id);

        if (!gym) {
            return res.status(404).json({ message: 'Academia não encontrada.' });
        }

        if (userRole === 'thrive_admin') {
            console.log('Usuário é thrive_admin. Permissão concedida.');
            return next();
        }

        if (userRole === 'provider') {
            const provider = await providersRepository.getProviderByUserId(userId);
            console.log('Prestador encontrado:', provider);
            
            console.log(`Comparando IDs: prestador.id=${provider ? provider.id : 'null'}, gym.provider_id=${gym.provider_id}`);

            if (provider && provider.id === gym.provider_id) {
                console.log('Prestador é o dono. Permissão concedida.');
                return next();
            }
        }

        logger.warn('Acesso negado: tentativa de deletar academia sem permissão',
            {
                userRole: userRole,
                userId: userId,
                gymId: id
            }
        );
        res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar esta academia.' });

    } catch (error) {
        console.error('Erro detalhado no middleware:', error);
        res.status(500).json({ error: 'Erro de autorização.' });
    }
}

module.exports = checkGymDeletePermission;