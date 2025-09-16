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
        // 1. Cria o usuário na tabela `users` JÁ COM O STATUS 'active'
        const [userResult] = await connection.execute(
            'INSERT INTO users (first_name, last_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, role, 'active'] // CORREÇÃO: Status definido como 'active'
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
    const [rows] = await connection.execute(
        `SELECT c.id, u.email, u.first_name, u.last_name, u.status
         FROM collaborators AS c
         JOIN users AS u ON c.user_id = u.id
         WHERE c.company_id = ? AND u.status = 'active'`,
        [companyId]
    );
    connection.end();
    return rows;
}

async function getInactiveCollaboratorsByCompanyId(companyId) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        `SELECT c.id, u.email, u.first_name, u.last_name, u.status
         FROM collaborators AS c
         JOIN users AS u ON c.user_id = u.id
         WHERE c.company_id = ? AND u.status = 'inactive'`, // <- FILTRO PARA INATIVOS
        [companyId]
    );
    connection.end();
    return rows;
}


async function deactivateCollaborator(collaboratorId) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [collaborators] = await connection.execute(
            'SELECT user_id FROM collaborators WHERE id = ?',
            [collaboratorId]
        );

        if (collaborators.length === 0) {
            throw new Error('Colaborador não encontrado.');
        }
        const userId = collaborators[0].user_id;

        // Atualiza o status na tabela users para 'inactive'
        const [result] = await connection.execute(
            'UPDATE users SET status = "inactive" WHERE id = ?',
            [userId]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.end();
    }
}

module.exports = {
    getCollaboratorsByCompanyId,
    getInactiveCollaboratorsByCompanyId,
    addCollaborator,
    deactivateCollaborator
};