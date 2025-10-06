// backend/controllers/adminController.js
const userRepository = require('../models/userRepository');
const bcrypt = require('bcryptjs');

async function createThriveAdmin(req, res) {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'O e-mail já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: 'thrive_admin',
            status: 'active' // Admins já são criados ativos
        };

        const newUserId = await userRepository.createUser(newUser);
        res.status(201).json({ message: 'Novo administrador ThriveCorp criado com sucesso!', id: newUserId });

    } catch (error) {
        console.error('Erro ao criar novo admin:', error);
        res.status(500).json({ error: 'Erro no servidor ao criar novo administrador.' });
    }
}

module.exports = { createThriveAdmin };