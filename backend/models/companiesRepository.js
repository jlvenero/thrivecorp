const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createCompany(companyData) {
    const connection = await mysql.createConnection(dbConfig);
    const { name, cnpj, address, admin_id } = companyData;
    const [result] = await connection.execute(
        'INSERT INTO companies (name, cnpj, address, admin_id, status) VALUES (?, ?, ?, ?, ?)',
        [name, cnpj, address, admin_id, 'pending']
    );
    connection.end();
    return result.insertId;
}

async function getAllCompanies(){
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM companies');
    connection.end();
    return rows;
}

async function getCompanyById(id) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM companies WHERE id = ?',
        [id]
    );
    connection.end();
    return rows[0] || null;
}

async function deactivateUser(userId) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE users SET status = "inactive" WHERE id = ?',
        [userId]
    );
    connection.end();
    return result.affectedRows > 0;
}

async function deleteCompany(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction(); // Inicia a transação

    try {
        // 1. Encontrar o ID do admin da empresa
        const [companyResult] = await connection.execute(
            'SELECT admin_id FROM companies WHERE id = ?',
            [id]
        );

        if (companyResult.length === 0) {
            // Se a empresa não existe, encerra a transação e retorna false
            await connection.rollback();
            connection.end();
            return false; // Indica que a empresa não foi encontrada
        }
        const adminId = companyResult[0]?.admin_id;

        // 2. Encontrar os IDs de todos os colaboradores da empresa
        const [collaboratorsResult] = await connection.execute(
            'SELECT user_id FROM collaborators WHERE company_id = ?',
            [id]
        );
        const collaboratorUserIds = collaboratorsResult.map(collab => collab.user_id);

        // 3. Montar a lista de todos os User IDs a serem desativados (Admin + Colaboradores)
        const userIdsToDeactivate = [];
        if (adminId) {
            userIdsToDeactivate.push(adminId);
        }
        userIdsToDeactivate.push(...collaboratorUserIds);

        // 4. Desativar todos os usuários encontrados (se houver algum)
        if (userIdsToDeactivate.length > 0) {
            // Usar a cláusula IN para atualizar múltiplos usuários de uma vez
            // O .map(?) cria os placeholders necessários (?, ?, ...)
            const placeholders = userIdsToDeactivate.map(() => '?').join(',');
            await connection.execute(
                `UPDATE users SET status = "inactive" WHERE id IN (${placeholders})`,
                userIdsToDeactivate
            );
            console.log(`Desativados usuários com IDs: ${userIdsToDeactivate.join(', ')}`); // Log para depuração
        }

        // 5. (Opcional, mas recomendado) Deletar os registros de colaboradores associados
        if (collaboratorUserIds.length > 0) {
             await connection.execute(
                'DELETE FROM collaborators WHERE company_id = ?',
                [id]
            );
            console.log(`Deletados colaboradores da empresa ID: ${id}`); // Log para depuração
        }


        // 6. Deletar a empresa
        const [deleteCompanyResult] = await connection.execute(
            'DELETE FROM companies WHERE id = ?',
            [id]
        );
        console.log(`Deletada empresa ID: ${id}`); // Log para depuração


        // 7. Se tudo correu bem, confirma a transação
        await connection.commit();
        connection.end();
        return deleteCompanyResult.affectedRows > 0; // Retorna true se a empresa foi deletada

    } catch (error) {
        // Se qualquer operação falhar, desfaz todas as alterações
        await connection.rollback();
        connection.end();
        console.error('Erro ao deletar empresa e desativar usuários:', error); // Log detalhado do erro
        throw error; // Propaga o erro para o controller
    }
}

async function approveCompany(id) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const [company] = await connection.execute(
            'SELECT admin_id FROM companies WHERE id = ?',
            [id]
        );
        const adminId = company[0]?.admin_id;

        const [updateCompanyResult] = await connection.execute(
            'UPDATE companies SET status = "active" WHERE id = ?',
            [id]
        );

        if (updateCompanyResult.affectedRows > 0 && adminId) {
            await connection.execute(
                'UPDATE users SET status = "active" WHERE id = ?',
                [adminId]
            );
        }

        await connection.commit();
        connection.end();
        return updateCompanyResult.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        connection.end();
        throw error;
    }
}

async function getCompanyByAdminId(adminId) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT * FROM companies WHERE admin_id = ?',
        [adminId]
    );
    connection.end();
    return rows[0] || null;
}


module.exports = {
    createCompany,
    getCompanyById,
    getAllCompanies,
    deactivateUser,
    deleteCompany,
    approveCompany,
    getCompanyByAdminId
};