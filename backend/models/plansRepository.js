const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createPlan(planData) {
    const { provider_id, name, description, price_per_access } = planData;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'INSERT INTO plans (provider_id, name, description, price_per_access) VALUES (?, ?, ?, ?)',
        [provider_id, name, description, price_per_access]
    );
    connection.end();
    return result.insertId;
}

async function getPlansByProviderId(providerId) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM plans WHERE provider_id = ?', [providerId]);
    connection.end();
    return rows;
}

async function updatePlan(planId, planData) {
    const { name, description, price_per_access } = planData;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE plans SET name = ?, description = ?, price_per_access = ? WHERE id = ?',
        [name, description, price_per_access, planId]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function deletePlan(planId) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'DELETE FROM plans WHERE id = ?',
        [planId]
    );
    connection.end();
    return result.affectedRows > 0;
}

module.exports = { 
    createPlan,
    getPlansByProviderId,
    updatePlan,
    deletePlan
};