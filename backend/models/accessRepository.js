const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function recordAccess(userId, gymId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'INSERT INTO accesses (user_id, gym_id) VALUES (?, ?)',
            [userId, gymId]
        );
        return result.insertId;
    } finally {
        connection.end();
    }
}

async function getAccessesByProviderId(providerId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT 
                a.id,
                a.access_timestamp,
                u.first_name,
                u.last_name,
                g.name AS gym_name
            FROM accesses AS a
            JOIN users AS u ON a.user_id = u.id
            JOIN gyms AS g ON a.gym_id = g.id
            WHERE g.provider_id = ?
            ORDER BY a.access_timestamp DESC
        `, [providerId]);
        return rows;
    } finally {
        connection.end();
    }
}

async function getAccessesByCompanyId(companyId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT 
                a.id,
                a.access_timestamp,
                u.first_name,
                u.last_name,
                g.name AS gym_name
            FROM collaborators AS c
            JOIN users AS u ON c.user_id = u.id
            JOIN accesses AS a ON u.id = a.user_id
            JOIN gyms AS g ON a.gym_id = g.id
            WHERE c.company_id = ?
            ORDER BY a.access_timestamp DESC
        `, [companyId]);
        return rows;
    } finally {
        connection.end();
    }
}


module.exports = {
    recordAccess,
    getAccessesByProviderId,
    getAccessesByCompanyId
};