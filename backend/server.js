const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const responseTime = require('response-time');
require('dotenv').config();
const logger = require('./utils/logger');

const { register, httpRequestDurationMicroseconds } = require('./utils/metrics');

const app = express();
const port = process.env.PORT || 8080;

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
  'https://d23y0llbzt72049.cloudfront.net',
  'https://thrivecorp.vercel.app', // seu domínio principal
  'https://thrivecorp-r6wc0vh6o-jlveneros-projects.vercel.app', // domínio temporário do preview
  'http://localhost:5173',
  'https://api.thrivecorp.click',
  'https://thrivecorp.click', // ambiente local
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));// 👈 ESSENCIAL: habilita o preflight
app.use(express.json());

app.use(responseTime((req, res, time) => {
    if (req.path === '/metrics') return;

    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds.observe(
        {
            method: req.method,
            route: route,
            code: res.statusCode
        },
        time / 1000
    );
}));

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Conexão com o banco
async function testDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    logger.info('Conexão com o banco de dados estabelecida', { component: 'db' });
    connection.end();
  } catch (error) {
    logger.error('Falha na conexão com o banco', { 
        component: 'db', 
        error: error.message,
        stack: error.stack
    });
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

app.listen(port, () => {
  logger.info('Servidor iniciado', { port: process.env.PORT, env: process.env.NODE_ENV });
});
