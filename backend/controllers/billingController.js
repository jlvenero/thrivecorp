const billingRepository = require('../models/billingRepository');
const logger = require('../utils/logger'); // <--- Importação do Logger

async function updateBillingStatus(req, res) {
    // Pega o status do corpo da requisição, default para 'sent' se não fornecido
    const { companyId, year, month, status = 'sent' } = req.body;
    
    if (!companyId || !year || !month || !['sent', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'ID da empresa, ano, mês e um status válido ("sent" ou "pending") são obrigatórios.' });
    }

    try {
        await billingRepository.upsertBillingStatus(companyId, year, month, status);
        
        // Log de Negócio: Registra quem alterou o status financeiro e para o que mudou
        logger.info('Status de faturamento atualizado', {
            action: 'billing_status_update',
            companyId,
            year,
            month,
            newStatus: status,
            adminId: req.user.userId // Rastreabilidade: quem fez a ação
        });

        res.status(200).json({ message: `Status de faturação atualizado para ${status}.` });
    } catch (error) {
        // Log de Erro estruturado
        logger.error(`Erro ao atualizar status para ${status}`, {
            action: 'billing_update_error',
            companyId,
            year,
            month,
            error: error.message,
            stack: error.stack
        });
        
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
        
        // Log de Negócio
        logger.info('Faturamento marcado como enviado', {
            action: 'billing_sent_marked',
            companyId,
            year,
            month,
            adminId: req.user.userId
        });

        res.status(200).json({ message: 'Status de faturação atualizado para enviado.' });
    } catch (error) {
        // Log de Erro estruturado
        logger.error('Erro ao marcar faturamento como enviado', {
            action: 'billing_sent_error',
            companyId,
            year,
            month,
            error: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ error: 'Erro no servidor ao atualizar o status.' });
    }
}

module.exports = {
    markAsSent,
    updateBillingStatus
};