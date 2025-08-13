const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createCompany(companyData) {
    const connection = await mysql.createConnection(dbConfig);
    const { name, cnpj, address, admin_id } = companyData;
    const [result] = await connection.execute(
        'INSERT INTO companies (name, cnpj, address, admin_id, status) VALUES (?, ?, ?, ?, ?)',
        [name, cnpj, address, admin_id, 'pending']
    );
    connection.end();
    return result.insertId;
}

async function getCompanyById(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM companies WHERE id = ?',
        [id]
    );
    connection.end();
    return rows[0] || null;
}

async function deleteCompany(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'DELETE FROM companies WHERE id = ?',
        [id]
    );
    connection.end();
    return result.affectedRows > 0;
}

module.exports = {
    createCompany,
    getCompanyById,
    deleteCompany,
};