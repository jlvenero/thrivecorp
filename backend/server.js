const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Middlewares
app.use(express.json());

// Configuração do CORS
const allowedOrigins = [
  'https://thrivecorp-r6wc0vh6o-jlveneros-projects.vercel.app',
  'http://localhost:5173', // ambiente local
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

// Conexão com o banco
async function testDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão com o banco de dados estabelecida!');
    connection.end();
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error.message);
  }
}

testDbConnection();

// Import das rotas
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const collaboratorsRoutes = require('./routes/collaborators');
const accessRoutes = require('./routes/accesses');
const plansRoutes = require('./routes/plans');
const profileRoutes = require('./routes/profile');
const providersRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');

// Registro das rotas
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/company', collaboratorsRoutes);
app.use('/api/accesses', accessRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', profileRoutes);
app.use('/api', providersRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API ThriveCorp está funcionando!');
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
