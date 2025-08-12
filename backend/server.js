// server.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Função de teste para garantir que a conexão funciona na sua aplicação
async function testDbConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexão com o banco de dados da aplicação estabelecida!');
        connection.end();
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error.message);
        process.exit(1);
    }
}

testDbConnection();