const accessRepository = require('../models/accessRepository');
const { Parser } = require('json2csv');

async function recordAccess(req, res) {
    const userId = req.user.userId;
    const { gymId } = req.body;

    if (!gymId) {
        return res.status(400).json({ error: 'O ID da academia é obrigatório.' });
    }

    try {
        const newAccessId = await accessRepository.recordAccess(userId, gymId);
        res.status(201).json({ message: 'Acesso registrado com sucesso!', accessId: newAccessId });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        res.status(500).json({ error: 'Erro ao registrar o acesso.' });
    }
}

async function getProviderAccessReport(req, res) {
    const providerId = req.provider.id;
    try {
        const accesses = await accessRepository.getAccessesByProviderId(providerId);
        res.status(200).json(accesses);
    } catch (error) {
        console.error('Erro ao buscar relatório de acessos do prestador:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de acessos.' });
    }
}

async function getCompanyAccessReport(req, res) {
    const companyId = req.companyId;
    try {
        const accesses = await accessRepository.getAccessesByCompanyId(companyId);
        res.status(200).json(accesses);
    } catch (error) {
        console.error('Erro ao buscar relatório de acessos da empresa:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de acessos.' });
    }
}

async function getMonthlyBillingReport(req, res) {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const report = await accessRepository.getMonthlyBillingReport(year, month);
        res.status(200).json(report);
    } catch (error) {
        console.error('Erro ao buscar relatório de faturamento mensal:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório de faturamento.' });
    }
}

async function getCompanyAccessDetails(req, res) {
    const { companyId } = req; // Injetado pelo middleware getCompanyDetails
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const report = await accessRepository.getCompanyAccessDetails(companyId, year, month);
        res.status(200).json(report);
    } catch (error) {
        console.error('Erro ao buscar relatório detalhado da empresa:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório detalhado.' });
    }
}

async function downloadCompanyAccessReport(req, res) {
    const { companyId } = req;
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const reportData = await accessRepository.getCompanyAccessDetails(companyId, year, month);

        if (reportData.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado para gerar o relatório.' });
        }

        const fields = [
            { label: 'Data e Hora', value: 'access_timestamp' },
            { label: 'Nome', value: 'first_name' },
            { label: 'Sobrenome', value: 'last_name' },
            { label: 'Academia', value: 'gym_name' },
            { label: 'Custo', value: 'price_per_access' }
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`relatorio-thrivecorp-${year}-${month}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Erro ao gerar relatório CSV:', error);
        res.status(500).json({ error: 'Erro ao gerar o relatório.' });
    } 
}

async function downloadBillingReport(req, res) {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Ano e mês são obrigatórios.' });
    }

    try {
        const reportData = await accessRepository.getMonthlyBillingReport(year, month);

        if (reportData.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado para gerar o relatório.' });
        }

        // Mapear status para 'Faturado' ou 'Pendente'
        const processedData = reportData.map(item => ({
            ...item,
            billing_status_label: item.billing_status === 'sent' ? 'Faturado' : 'Pendente',
            // Formatar custo para padrão brasileiro (ex: 1234.50 -> 1.234,50)
            total_cost_formatted: parseFloat(item.total_cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }));


        const fields = [
            { label: 'Empresa', value: 'company_name' },
            { label: 'Total de Acessos', value: 'total_accesses' },
            // Usar o valor formatado para o CSV
            { label: 'Custo Total', value: 'total_cost_formatted' },
            // Usar o label do status
            { label: 'Status da Fatura', value: 'billing_status_label' }
        ];

        // Configuração do Parser para UTF-8 com BOM (melhor compatibilidade com Excel)
        const json2csvParser = new Parser({ fields, withBOM: true });
        const csv = json2csvParser.parse(processedData);

        res.header('Content-Type', 'text/csv; charset=utf-8'); // Especificar charset UTF-8
        res.attachment(`relatorio-faturamento-${year}-${month}.csv`);
        res.send(csv); // Envia o CSV diretamente

    } catch (error) {
        console.error('Erro ao gerar relatório CSV de faturamento:', error);
        res.status(500).json({ error: 'Erro ao gerar o relatório.' });
    }
}

module.exports = {
    recordAccess,
    getProviderAccessReport,
    getCompanyAccessReport,
    getMonthlyBillingReport,
    getCompanyAccessDetails,
    downloadCompanyAccessReport,
    downloadBillingReport
};