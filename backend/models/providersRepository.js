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
        // Passo 1: Encontrar o provider_id a partir do gymId
        const [gyms] = await connection.execute('SELECT provider_id FROM gyms WHERE id = ?', [gymId]);
        if (gyms.length === 0) {
            throw new Error('Academia não encontrada.');
        }
        const providerId = gyms[0].provider_id;

        // Passo 2: Encontrar o user_id a partir do providerId
        const [providers] = await connection.execute('SELECT user_id FROM providers WHERE id = ?', [providerId]);
        if (providers.length === 0) {
            throw new Error('Prestador de serviço não encontrado.');
        }
        const userId = providers[0].user_id;

        // Passo 3: Deletar a academia (gym)
        await connection.execute('DELETE FROM gyms WHERE id = ?', [gymId]);

        // Passo 4: Deletar o prestador (provider)
        await connection.execute('DELETE FROM providers WHERE id = ?', [providerId]);

        // Passo 5: Desativar o usuário (user)
        await connection.execute('UPDATE users SET status = "inactive" WHERE id = ?', [userId]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error("Erro na transação de reprovação:", error); // Adiciona um log de erro detalhado
        throw error;
    } finally {
        connection.end();
    }
}

async function approveGym(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        // 1. Atualiza o status da academia para 'active'
        const [updateGymResult] = await connection.execute(
            'UPDATE gyms SET status = "active" WHERE id = ?',
            [id]
        );

        // Se a academia foi atualizada, encontre o usuário associado para ativá-lo
        if (updateGymResult.affectedRows > 0) {
            // 2. Encontre a academia para obter o provider_id
            const [gyms] = await connection.execute(
                'SELECT provider_id FROM gyms WHERE id = ?',
                [id]
            );

            if (gyms.length > 0) {
                const providerId = gyms[0].provider_id;
                
                // 3. Encontre o prestador para obter o user_id
                const [providers] = await connection.execute(
                    'SELECT user_id FROM providers WHERE id = ?',
                    [providerId]
                );

                if (providers.length > 0) {
                    const userId = providers[0].user_id;

                    // 4. Atualize o status do usuário para 'active'
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
        throw error; // Lança o erro para ser tratado no controller
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
    reproveGymAndDeactivateProvider,
    getGymsByProviderId,
    getAllGyms,
    getGymById,
    updateGym,
    deleteGym,
    approveGym,
    getProviderByUserId,
};