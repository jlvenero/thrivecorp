const providersRepository = require('../models/providersRepository');
const plansRepository = require('../models/plansRepository');
const logger = require('../utils/logger');

async function registerProvider(req, res) {
    const { user_id, name, cnpj } = req.body;
    try {
        const newProviderId = await providersRepository.createProvider({ user_id, name, cnpj });
        res.status(201).json({ message: 'Prestador de serviço registrado com sucesso.', id: newProviderId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar o prestador de serviço.' });
    }
}

async function registerGym(req, res) {
    const { provider_id, name, address } = req.body;
    try {
        const newGymId = await providersRepository.createGym({ provider_id, name, address });
        res.status(201).json({ message: 'Academia solicitada para registro com sucesso.', id: newGymId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao solicitar registro da academia.' });
    }
}

async function listProviders(req, res) {
    try {
        const providers = await providersRepository.getAllProviders();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar prestadores.' });
    }
}

async function listAllGymsForAdmin(req, res) {
    try {
        const gyms = await providersRepository.getAllGymsForAdmin();
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar academias para o admin.' });
    }
}

async function getProvider(req, res) {
    const { id } = req.params;
    try {
        const provider = await providersRepository.getProviderById(id);
        if (provider) {
            res.json(provider);
        } else {
            res.status(404).json({ message: 'Prestador não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar prestador.' });
    }
}

async function updateProvider(req, res) {
    const { id } = req.params;
    const { name, cnpj } = req.body;
    try {
        const success = await providersRepository.updateProvider(id, { name, cnpj });
        if (success) {
            res.json({ message: 'Prestador atualizado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Prestador não encontrado para atualização.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar prestador.' });
    }
}

async function deleteProvider(req, res) {
    const { id } = req.params;
    try {
        const success = await providersRepository.deleteProvider(id);
        if (success) {
            res.json({ message: 'Prestador deletado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Prestador não encontrado para exclusão.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar prestador.' });
    }
}

async function getGymPlan(req, res) {
    const { gymId } = req.params;
    try {
        const plan = await plansRepository.getPlanByGymId(gymId);
        if (plan) {
            res.json(plan);
        } else {
            res.status(404).json({ message: 'Nenhum plano encontrado para esta academia.' });
        }
    } catch (error) {
        console.error('Erro ao buscar plano da academia:', error);
        res.status(500).json({ error: 'Erro ao buscar o plano da academia.' });
    }
}

async function listProviderGyms(req, res) {
    console.log('Controlador listProviderGyms: req.provider.id recebido:', req.provider.id);
    try {
        const gyms = await providersRepository.getGymsByProviderId(req.provider.id);
        res.json(gyms);
    } catch (error) {
        console.error('Erro ao listar academias do prestador:', error);
        res.status(500).json({ error: 'Erro ao listar academias.' });
    }
}

async function listGyms(req, res) {
    try {
        const gyms = await providersRepository.getAllGyms();
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar academias.' });
    }
}

async function getGym(req, res) {
    const { id } = req.params;
    try {
        const gym = await providersRepository.getGymById(id);
        if (gym) {
            res.json(gym);
        } else {
            res.status(404).json({ message: 'Academia não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar academia.' });
    }
}

async function updateGym(req, res) {
    const { id } = req.params;
    const { name, address, status } = req.body;
    try {
        const success = await providersRepository.updateGym(id, { name, address, status });
        if (success) {
            res.json({ message: 'Academia atualizada com sucesso.' });
        } else {
            res.status(404).json({ message: 'Academia não encontrada para atualização.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar academia.' });
    }
}

async function deleteGym(req, res) {
    const { id } = req.params;
    try {
        const success = await providersRepository.deleteGym(id);
        if (success) {
            res.json({ message: 'Academia deletada com sucesso.' });
        } else {
            res.status(404).json({ message: 'Academia não encontrada para exclusão.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar academia.' });
    }
}

async function approveGym(req, res) {
    const { id } = req.params;
    try {
        const success = await providersRepository.approveGym(id);
        if (success) {
            res.status(200).json({ message: 'Academia aprovada com sucesso!' });
        } else {
            res.status(404).json({ message: 'Academia não encontrada para aprovação.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar a academia.' });
    }
}

async function reproveGym(req, res) {
    const { id } = req.params;
    try {
        const success = await providersRepository.reproveGymAndDeactivateProvider(id);
        if (success) {
            logger.warn('Academia reprovada e removida', {
            action: 'gym_rejection',
            gymId: req.params.id,
            adminId: req.user.userId
});
            res.status(200).json({ message: 'Academia reprovada e usuário desativado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Academia não encontrada para reprovação.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao reprovar a academia.' });
    }
}

async function addOwnGym(req, res) {
    const providerId = req.provider.id;
    const { name, address } = req.body;

    try {
        const newGymId = await providersRepository.createGym({ provider_id: providerId, name, address });
        res.status(201).json({ message: 'Nova academia cadastrada com sucesso e aguardando aprovação.', id: newGymId });
    } catch (error) {
        console.error('Erro ao cadastrar nova academia:', error);
        res.status(500).json({ error: 'Erro ao cadastrar a nova academia.' });
    }
}

module.exports = {
    registerProvider,
    registerGym,
    listProviders,
    getProvider,
    updateProvider,
    deleteProvider,
    listProviderGyms,
    listGyms,
    getGym,
    updateGym,
    deleteGym,
    approveGym,
    reproveGym,
    addOwnGym,
    listAllGymsForAdmin,
    getGymPlan
};