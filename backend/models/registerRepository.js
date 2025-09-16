const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function registerUserAndEntity(userData) {
    const connection = await mysql.createConnection(dbConfig);
    const { first_name, last_name, email, password, role, company_name, company_cnpj, company_address, provider_name, provider_cnpj, provider_address } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await connection.beginTransaction();

    try {
        const [userResult] = await connection.execute(
            'INSERT INTO users (first_name, last_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, role, 'pending']
        );
        const newUserId = userResult.insertId;

        if (role === 'company_admin') {
            await connection.execute(
                'INSERT INTO companies (name, cnpj, address, admin_id, status) VALUES (?, ?, ?, ?, ?)',
                [company_name, company_cnpj, company_address, newUserId, 'pending']
            );
        } else if (role === 'provider') {
            await connection.execute(
                'INSERT INTO providers (name, cnpj, user_id) VALUES (?, ?, ?)',
                [provider_name, provider_cnpj, newUserId]
            );
            // lógica das academias
        }

        await connection.commit();
        return newUserId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.end();
    }
}

module.exports = {
    registerUserAndEntity,
};