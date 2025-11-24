const client = require('prom-client');

// Cria um registro para armazenar as métricas
const register = new client.Registry();

// Coleta métricas padrão do Node.js (GC, Event Loop, Memória, CPU)
client.collectDefaultMetrics({
    app: 'thrivecorp-api',
    prefix: 'node_',
    timeout: 10000,
    register
});

// --- Métricas HTTP (Técnicas) ---
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// --- Métricas de Negócio (Customizadas) ---
const checkinsTotal = new client.Counter({
    name: 'business_checkins_total',
    help: 'Total de check-ins realizados nas academias',
    labelNames: ['gym_name']
});

const usersRegisteredTotal = new client.Counter({
    name: 'business_users_registered_total',
    help: 'Total de novos usuários registrados',
    labelNames: ['role']
});

// Registra as métricas personalizadas
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(checkinsTotal);
register.registerMetric(usersRegisteredTotal);

module.exports = {
    register,
    httpRequestDurationMicroseconds,
    checkinsTotal,
    usersRegisteredTotal
};