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
    const [rows] = await connection.execute("SELECT * FROM gyms WHERE status = 'active'");
    connection.end();
    return rows;
}

async function getAllGymsForAdmin() {
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

async function reproveGymAndDeactivateProvider(gymId) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [gyms] = await connection.execute('SELECT provider_id FROM gyms WHERE id = ?', [gymId]);
        if (gyms.length === 0) {
            throw new Error('Academia a ser reprovada não encontrada.');
        }
        const providerId = gyms[0].provider_id;

        const [deleteResult] = await connection.execute('DELETE FROM gyms WHERE id = ?', [gymId]);
        if (deleteResult.affectedRows === 0) {
            throw new Error('Falha ao deletar a academia especificada.');
        }

        const [remainingGyms] = await connection.execute(
            'SELECT COUNT(*) as count FROM gyms WHERE provider_id = ?',
            [providerId]
        );
        const gymCount = remainingGyms[0].count;

        if (gymCount === 0) {
            const [providers] = await connection.execute('SELECT user_id FROM providers WHERE id = ?', [providerId]);
            if (providers.length > 0) {
                const userId = providers[0].user_id;

                await connection.execute('DELETE FROM providers WHERE id = ?', [providerId]);

                await connection.execute('UPDATE users SET status = "inactive" WHERE id = ?', [userId]);
            }
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error("Erro na transação de reprovação:", error);
        throw error;
    } finally {
        connection.end();
    }
}

async function approveGym(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [updateGymResult] = await connection.execute(
            'UPDATE gyms SET status = "active" WHERE id = ?',
            [id]
        );

        if (updateGymResult.affectedRows > 0) {
            const [gyms] = await connection.execute(
                'SELECT provider_id FROM gyms WHERE id = ?',
                [id]
            );

            if (gyms.length > 0) {
                const providerId = gyms[0].provider_id;
                
                const [providers] = await connection.execute(
                    'SELECT user_id FROM providers WHERE id = ?',
                    [providerId]
                );

                if (providers.length > 0) {
                    const userId = providers[0].user_id;

                    await connection.execute(
                        'UPDATE users SET status = "active" WHERE id = ?',
                        [userId]
                    );
                }
            }
        }

        await connection.commit();
        return updateGymResult.affectedRows > 0;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.end();
    }
}

async function getProviderByUserId(userId) {
    console.log('Repositório: Buscando prestador para userId:', userId);
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM providers WHERE user_id = ?',
        [userId]
    );
    connection.end();
    return rows[0] || null;
}

module.exports = {
    createProvider,
    createGym,
    getAllProviders,
    getProviderById,
    updateProvider,
    deleteProvider,
    reproveGymAndDeactivateProvider,
    getGymsByProviderId,
    getAllGyms,
    getGymById,
    updateGym,
    deleteGym,
    approveGym,
    getProviderByUserId,
    getAllGymsForAdmin
};