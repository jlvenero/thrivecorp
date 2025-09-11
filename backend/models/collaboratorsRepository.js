const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

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
};