const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function upsertBillingStatus(companyId, year, month, status) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            `INSERT INTO billing_history (company_id, billing_year, billing_month, status, sent_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), sent_at = VALUES(sent_at)`,
            [companyId, year, month, status, new Date()]
        );
        return result;
    } finally {
        connection.end();
    }
}

module.exports = {
    upsertBillingStatus
};