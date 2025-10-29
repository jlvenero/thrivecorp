const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createPlan(planData) {
    const { provider_id, gym_id, name, description, price_per_access } = planData; // Adicione gym_id
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'INSERT INTO plans (provider_id, gym_id, name, description, price_per_access) VALUES (?, ?, ?, ?, ?)', // Adicione gym_id
        [provider_id, gym_id, name, description, price_per_access] // Adicione gym_id
    );
    connection.end();
    return result.insertId;
}

async function getPlansByProviderId(providerId) {
    const connection = await mysql.createConnection(dbConfig);
    // Vamos selecionar o gym_id também
    const [rows] = await connection.execute('SELECT id, name, description, price_per_access, gym_id FROM plans WHERE provider_id = ?', [providerId]);
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

async function getPlanByGymId(gymId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM plans WHERE gym_id = ?',
            [gymId]
        );
        return rows[0] || null; // Retorna o plano ou nulo se não encontrar
    } finally {
        connection.end();
    }
}

module.exports = { 
    createPlan,
    getPlansByProviderId,
    updatePlan,
    deletePlan,
    getPlanByGymId
};