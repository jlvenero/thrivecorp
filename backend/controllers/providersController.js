const providersRepository = require('../models/providersRepository');

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

module.exports = {
    registerProvider,
    registerGym,
    listProviders,
    getProvider,
    updateProvider,
    deleteProvider,
    listGyms,
    getGym,
    updateGym,
    deleteGym
};