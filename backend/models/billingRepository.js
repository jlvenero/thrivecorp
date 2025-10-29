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
        // Se o status for 'sent', atualiza sent_at, senão, mantém o valor existente ou define como NULL
        const sentAtValue = status === 'sent' ? new Date() : null; // Define null ao desmarcar

        const [result] = await connection.execute(
            `INSERT INTO billing_history (company_id, billing_year, billing_month, status, sent_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), sent_at = IF(VALUES(status) = 'sent', VALUES(sent_at), NULL)`, // Atualiza sent_at condicionalmente
            [companyId, year, month, status, sentAtValue]
        );
        return result;
    } finally {
        connection.end();
    }
}

module.exports = {
    upsertBillingStatus
};