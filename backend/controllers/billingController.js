const billingRepository = require('../models/billingRepository');

async function updateBillingStatus(req, res) {
    // Pega o status do corpo da requisição, default para 'sent' se não fornecido (mantém comportamento antigo se necessário)
    const { companyId, year, month, status = 'sent' } = req.body;
    if (!companyId || !year || !month || !['sent', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'ID da empresa, ano, mês e um status válido ("sent" ou "pending") são obrigatórios.' });
    }

    try {
        await billingRepository.upsertBillingStatus(companyId, year, month, status);
        res.status(200).json({ message: `Status de faturação atualizado para ${status}.` });
    } catch (error) {
        console.error(`Erro ao atualizar status para ${status}:`, error);
        res.status(500).json({ error: 'Erro no servidor ao atualizar o status.' });
    }
}

async function markAsSent(req, res) {
    const { companyId, year, month } = req.body;
    if (!companyId || !year || !month) {
        return res.status(400).json({ error: 'ID da empresa, ano e mês são obrigatórios.' });
    }

    try {
        await billingRepository.upsertBillingStatus(companyId, year, month, 'sent');
        res.status(200).json({ message: 'Status de faturação atualizado para enviado.' });
    } catch (error) {
        console.error('Erro ao marcar como enviado:', error);
        res.status(500).json({ error: 'Erro no servidor ao atualizar o status.' });
    }
}

module.exports = {
    markAsSent,
    updateBillingStatus
};