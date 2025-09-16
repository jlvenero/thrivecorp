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

async function getAllCompanies(){
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM companies');
    connection.end();
    return rows;
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

async function deactivateUser(userId) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE users SET status = "inactive" WHERE id = ?',
        [userId]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function deleteCompany(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [company] = await connection.execute(
            'SELECT admin_id FROM companies WHERE id = ?',
            [id]
        );
        const adminId = company[0]?.admin_id;

        const [deleteCompanyResult] = await connection.execute(
            'DELETE FROM companies WHERE id = ?',
            [id]
        );

        if (deleteCompanyResult.affectedRows > 0 && adminId) {
            await connection.execute(
                'UPDATE users SET status = "inactive" WHERE id = ?',
                [adminId]
            );
        }

        await connection.commit();
        connection.end();
        return deleteCompanyResult.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        connection.end();
        throw error;
    }
}

async function approveCompany(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [company] = await connection.execute(
            'SELECT admin_id FROM companies WHERE id = ?',
            [id]
        );
        const adminId = company[0]?.admin_id;

        const [updateCompanyResult] = await connection.execute(
            'UPDATE companies SET status = "active" WHERE id = ?',
            [id]
        );

        if (updateCompanyResult.affectedRows > 0 && adminId) {
            await connection.execute(
                'UPDATE users SET status = "active" WHERE id = ?',
                [adminId]
            );
        }

        await connection.commit();
        connection.end();
        return updateCompanyResult.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        connection.end();
        throw error;
    }
}

module.exports = {
    createCompany,
    getCompanyById,
    getAllCompanies,
    deactivateUser,
    deleteCompany,
    approveCompany
};