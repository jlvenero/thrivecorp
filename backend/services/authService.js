const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../models/userRepository');
const registerRepository = require('../models/registerRepository'); 
const logger = require('../utils/logger'); // <--- Importação do Logger

const JWT_SECRET = process.env.JWT_SECRET;

async function validateCredentialsAndGenerateToken(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        // Log de segurança: Alguém tentou logar com um email que não existe
        logger.warn('Tentativa de login com e-mail inexistente', { email });
        return null;
    }

    if (user.status !== 'active') {
        // Log de aviso: Usuário tentou entrar mas ainda não foi aprovado
        logger.warn('Tentativa de login em conta inativa ou pendente', { 
            email, 
            status: user.status 
        });
        throw new Error('Conta pendente de aprovação ou inativa.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        // Log de segurança: Senha errada (importante para detectar força bruta)
        logger.warn('Tentativa de login com senha incorreta', { email });
        return null;
    }

    // Log de sucesso: Auditoria de quem entrou e quando
    logger.info('Login realizado com sucesso', { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token, user: { id: user.id, email: user.email, role: user.role } };
}

async function submitRegistrationRequest(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
        logger.warn('Tentativa de cadastro com e-mail já existente', { email: userData.email });
        throw new Error('E-mail já cadastrado.');
    }
    
    const newUserId = await registerRepository.registerUserAndEntity(userData);
    
    logger.info('Solicitação de registro enviada', { 
        action: 'registration_request',
        email: userData.email, 
        role: userData.role,
        newUserId 
    });
    
    return newUserId;
}

async function registerUser(userData) {
    const { email, password, role, first_name, last_name } = userData;
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        logger.warn('Tentativa de registro interno com e-mail duplicado', { email });
        throw new Error('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { ...userData, password: hashedPassword };

    const newUserId = await userRepository.createUser(newUser);

    logger.info('Novo usuário registrado internamente', { 
        action: 'internal_registration',
        email, 
        role, 
        newUserId 
    });

    return newUserId;
}

async function changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
        logger.error('Tentativa de troca de senha para usuário não encontrado', { userId });
        throw new Error('Usuário não encontrado.');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        logger.warn('Falha na troca de senha: senha antiga incorreta', { userId, email: user.email });
        throw new Error('A senha antiga está incorreta.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await userRepository.updatePassword(userId, hashedNewPassword);

    logger.info('Senha alterada com sucesso', { userId, email: user.email });

    return result;
}

module.exports = {
    validateCredentialsAndGenerateToken,
    submitRegistrationRequest,
    registerUser,
    changePassword,
};