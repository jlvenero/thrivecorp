const plansRepository = require('../models/plansRepository');

async function createPlan(req, res) {
    const providerId = req.provider.id;
    const { name, description, price_per_access } = req.body;
    try {
        const newPlanId = await plansRepository.createPlan({ provider_id: providerId, name, description, price_per_access });
        res.status(201).json({ message: 'Plano criado com sucesso!', id: newPlanId });
    } catch (error) {
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

module.exports = { createPlan, getMyPlans };