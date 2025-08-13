const express = require('express');
const cors = require('cors'); 
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

app.use(express.json());
app.use(cors());

async function testDbConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexão com o banco de dados da aplicação estabelecida!');
        connection.end();
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error.message);
    }
}

testDbConnection();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const companiesRoutes = require('./routes/companies');

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes)
app.use('/api/companies', companiesRoutes);

app.get('/', (req, res) => {
    res.send('API ThriveCorp está funcionando!');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});