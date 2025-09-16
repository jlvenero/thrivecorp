const authService = require('../services/authService');

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const result = await authService.validateCredentialsAndGenerateToken(email, password);
        if (!result) {
            return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function register(req, res) {
    const { email, password, role, first_name, last_name } = req.body;
    try {
        const newUserId = await authService.registerUser({ email, password, role, first_name, last_name });
        res.status(201).json({ message: 'Usuário registrado com sucesso!', id: newUserId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function changePassword(req, res) {
    const { userId, newPassword } = req.body;
    try {
        const success = await authService.changePassword(userId, newPassword);
        if (success) {
            res.status(200).json({ message: 'Senha alterada com sucesso.' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
}

async function submitRegistrationRequest(req, res) {
    const { 
        first_name, last_name, email, password, role,
        company_name, company_cnpj, company_address,
        provider_name, provider_cnpj, provider_address 
    } = req.body;
    try {
        const newUserId = await authService.submitRegistrationRequest({
            first_name, last_name, email, password, role,
            company_name, company_cnpj, company_address,
            provider_name, provider_cnpj, provider_address
        });
        res.status(201).json({ message: 'Registro enviado com sucesso! Aguarde a aprovação.', id: newUserId });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: 'Erro ao processar o registro.' });
    }
}

module.exports = {
    login,
    register,
     changePassword,
    submitRegistrationRequest
};