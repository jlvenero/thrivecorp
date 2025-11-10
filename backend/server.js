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

const allowedOrigins = [
  'https://thrivecorp-r6wc0vh6o-jlveneros-projects.vercel.app',
  'http://localhost:5173', // para testes locais
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

async function testDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexão com o banco de dados estabelecida!');
    connection.end();
  } catch (error) {
    console.error('Erro na conexão com o banco de dados:', error.message);
  }
}

testDbConnection();

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const collaboratorsRoutes = require('./routes/collaborators');
const accessRoutes = require('./routes/accesses');
const plansRoutes = require('./routes/plans');
const profileRoutes = require('./routes/profile');
const providersRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/company', collaboratorsRoutes);
app.use('/api/accesses', accessRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', profileRoutes);
app.use('/api', providersRoutes);

app.get('/', (req, res) => {
  res.send('API ThriveCorp está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});