const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Função para criar um novo usuário e associá-lo como colaborador a uma empresa
async function addCollaborator(collaboratorData, companyId) {
    const connection = await mysql.createConnection(dbConfig);
    const { first_name, last_name, email, password } = collaboratorData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'collaborator';

    await connection.beginTransaction();

    try {
        // 1. Cria o usuário na tabela `users`
        const [userResult] = await connection.execute(
            'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, role]
        );
        const newUserId = userResult.insertId;

        // 2. Cria o registro do colaborador na tabela `collaborators`
        await connection.execute(
            'INSERT INTO collaborators (user_id, company_id, status) VALUES (?, ?, ?)',
            [newUserId, companyId, 'active']
        );

        await connection.commit();
        return newUserId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.end();
    }
}

async function getCollaboratorsByCompanyId(companyId) {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Executando query para companyId:', companyId); // Log para ver o ID na query
    const [rows] = await connection.execute(
        `SELECT c.id, u.email, u.first_name, u.last_name, c.status
         FROM collaborators AS c
         JOIN users AS u ON c.user_id = u.id
         WHERE c.company_id = ?`,
        [companyId]
    );
    connection.end();
    return rows;
}

module.exports = {
    getCollaboratorsByCompanyId,
    addCollaborator
};