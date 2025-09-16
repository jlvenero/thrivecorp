const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../models/userRepository');
const registerRepository = require('../models/registerRepository'); 

const JWT_SECRET = process.env.JWT_SECRET;

async function validateCredentialsAndGenerateToken(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        return null;
    }

    if (user.status !== 'active') {
        throw new Error('Conta pendente de aprovação ou inativa.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return null;
    }

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
        throw new Error('E-mail já cadastrado.');
    }
    const newUserId = await registerRepository.registerUserAndEntity(userData);
    return newUserId;
}

async function registerUser(userData) {
    const { email, password, role, first_name, last_name } = userData;
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        throw new Error('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { ...userData, password: hashedPassword };

    const newUserId = await userRepository.createUser(newUser);

    return newUserId;
}

async function changePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await userRepository.updatePassword(userId, hashedPassword);
}

module.exports = {
    validateCredentialsAndGenerateToken,
    submitRegistrationRequest,
    registerUser,
    changePassword,
};