const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createProvider(providerData) {
    const connection = await mysql.createConnection(dbConfig);
    const { user_id, name, cnpj } = providerData;
    const [result] = await connection.execute(
        'INSERT INTO providers (user_id, name, cnpj) VALUES (?, ?, ?)',
        [user_id, name, cnpj]
    );
    connection.end();
    return result.insertId;
}

async function createGym(gymData) {
    const connection = await mysql.createConnection(dbConfig);
    const { provider_id, name, address } = gymData;
    const [result] = await connection.execute(
        'INSERT INTO gyms (provider_id, name, address, status) VALUES (?, ?, ?, ?)',
        [provider_id, name, address, 'pending']
    );
    connection.end();
    return result.insertId;
}

async function getAllProviders() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM providers');
    connection.end();
    return rows;
}

async function getProviderById(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM providers WHERE id = ?', [id]
    );
    connection.end();
    return rows[0] || null;
}

async function updateProvider(id, providerData) {
    const connection = await mysql.createConnection(dbConfig);
    const { name, cnpj } = providerData;
    const [result] = await connection.execute(
        'UPDATE providers SET name = ?, cnpj = ? WHERE id = ?',
        [name, cnpj, id]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function deleteProvider(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'DELETE FROM providers WHERE id = ?',
        [id]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function getGymsByProviderId(providerId) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM gyms WHERE provider_id = ?',
        [providerId]
    );
    connection.end();
    return rows;
}

async function getAllGyms() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM gyms');
    connection.end();
    return rows;
}

async function getGymById(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM gyms WHERE id = ?',
        [id]
    );
    connection.end();
    return rows[0] || null;
}

async function updateGym(id, gymData) {
    const connection = await mysql.createConnection(dbConfig);
    const { name, address, status } = gymData;
    const [result] = await connection.execute(
        'UPDATE gyms SET name = ?, address = ?, status = ? WHERE id = ?',
        [name, address, status, id]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function deleteGym(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'DELETE FROM gyms WHERE id = ?',
        [id]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function approveGym(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE gyms SET status = "active" WHERE id = ?',
        [id]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function getProviderByUserId(userId) {
    console.log('Repositório: Buscando prestador para userId:', userId);
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM providers WHERE user_id = ?',
        [userId]
    );
    connection.end();
    // Retorne o primeiro resultado ou null se a lista estiver vazia
    return rows[0] || null;
}

module.exports = {
    createProvider,
    createGym,
    getAllProviders,
    getProviderById,
    updateProvider,
    deleteProvider,
    getGymsByProviderId,
    getAllGyms,
    getGymById,
    updateGym,
    deleteGym,
    approveGym,
    getProviderByUserId
};