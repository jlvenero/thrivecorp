const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function findByEmail(email) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    connection.end();
    return rows[0] || null;
}

async function createUser(userData) {
    const connection = await mysql.createConnection(dbConfig);
    const { email, password, role, first_name, last_name } = userData;
    const [result] = await connection.execute(
        'INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [email, password, role, first_name, last_name]
    );
    connection.end();
    return result.insertId;
}

async function updatePassword(userId, newHashedPassword) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [newHashedPassword, userId]
    );
    connection.end();
    return result.affectedRows > 0;
}

module.exports = {
    findByEmail,
    createUser,
    updatePassword,
};