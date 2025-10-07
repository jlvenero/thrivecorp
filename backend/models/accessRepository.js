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

async function getMonthlyBillingReport(year, month) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                comp.id AS company_id,
                comp.name AS company_name,
                COUNT(a.id) AS total_accesses,
                SUM(p.price_per_access) AS total_cost,
                IFNULL(bh.status, 'pending') AS billing_status
            FROM accesses AS a
            JOIN users AS u ON a.user_id = u.id
            JOIN collaborators AS collabs ON u.id = collabs.user_id
            JOIN companies AS comp ON collabs.company_id = comp.id
            JOIN gyms AS g ON a.gym_id = g.id
            JOIN providers AS prov ON g.provider_id = prov.id
            LEFT JOIN (
                SELECT 
                    provider_id, 
                    price_per_access,
                    ROW_NUMBER() OVER(PARTITION BY provider_id ORDER BY id) as rn
                FROM plans
            ) AS p ON prov.id = p.provider_id AND p.rn = 1
            LEFT JOIN billing_history AS bh 
                ON comp.id = bh.company_id AND bh.billing_year = ? AND bh.billing_month = ?
            WHERE YEAR(a.access_timestamp) = ? AND MONTH(a.access_timestamp) = ?
            GROUP BY comp.id, comp.name, bh.status
            ORDER BY comp.name;
        `, [year, month, year, month]);
        return rows;
    } finally {
        connection.end();
    }
}

async function getCompanyAccessDetails(companyId, year, month) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT 
                a.id,
                a.access_timestamp,
                u.first_name,
                u.last_name,
                g.name AS gym_name,
                p.price_per_access
            FROM accesses AS a
            JOIN users AS u ON a.user_id = u.id
            JOIN collaborators AS collabs ON u.id = collabs.user_id
            JOIN gyms AS g ON a.gym_id = g.id
            JOIN providers AS prov ON g.provider_id = prov.id
            LEFT JOIN (
                SELECT 
                    provider_id, 
                    price_per_access,
                    ROW_NUMBER() OVER(PARTITION BY provider_id ORDER BY id) as rn
                FROM plans
            ) AS p ON prov.id = p.provider_id AND p.rn = 1
            WHERE collabs.company_id = ? AND YEAR(a.access_timestamp) = ? AND MONTH(a.access_timestamp) = ?
            ORDER BY a.access_timestamp DESC;
        `, [companyId, year, month]);
        return rows;
    } finally {
        connection.end();
    }
}

module.exports = {
    recordAccess,
    getAccessesByProviderId,
    getAccessesByCompanyId,
    getMonthlyBillingReport,
    getCompanyAccessDetails
};