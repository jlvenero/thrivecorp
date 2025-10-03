const plansRepository = require('../models/plansRepository');

async function createPlan(req, res) {
    const providerId = req.provider.id;
    const { name, description, price_per_access } = req.body;
    try {
        const newPlanId = await plansRepository.createPlan({ provider_id: providerId, name, description, price_per_access });
        res.status(201).json({ message: 'Plano criado com sucesso!', id: newPlanId });
    } catch (error) {
        console.error('Erro detalhado ao criar plano:', error); 
        res.status(500).json({ error: 'Erro ao criar o plano.' });
    }
}

async function getMyPlans(req, res) {
    const providerId = req.provider.id;
    try {
        const plans = await plansRepository.getPlansByProviderId(providerId);
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar os planos.' });
    }
}

async function updatePlan(req, res) {
    const { planId } = req.params;
    // Aqui podemos adicionar uma verificação para garantir que o plano pertence ao provider logado, por segurança.
    try {
        const success = await plansRepository.updatePlan(planId, req.body);
        if (success) {
            res.status(200).json({ message: 'Plano atualizado com sucesso!' });
        } else {
            res.status(404).json({ message: 'Plano não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o plano.' });
    }
}

async function deletePlan(req, res) {
    const { planId } = req.params;
    // Aqui também caberia uma verificação de propriedade.
    try {
        const success = await plansRepository.deletePlan(planId);
        if (success) {
            res.status(200).json({ message: 'Plano deletado com sucesso!' });
        } else {
            res.status(404).json({ message: 'Plano não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o plano.' });
    }
}

module.exports = { 
    createPlan, 
    getMyPlans,
    updatePlan,
    deletePlan
};