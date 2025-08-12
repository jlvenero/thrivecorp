// models/itemModel.js
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createItem(name, description) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'INSERT INTO items (name, description) VALUES (?, ?)',
        [name, description]
    );
    connection.end();
    return rows.insertId;
}

async function getAllItems() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM items');
    connection.end();
    return rows;
}

// ...Você pode adicionar funções para `update` e `delete` aqui

module.exports = {
    createItem,
    getAllItems,
};