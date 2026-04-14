require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const connectDB = require('./src/config/db');
const { port, nodeEnv } = require('./src/config/env');
const v1Routes = require('./src/routes/v1/index');
const errorHandler = require('./src/middlewares/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
});
app.use('/api', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again later.' },
});
app.use('/api/v1/auth', authLimiter);

// ── Swagger Docs ──────────────────────────────────────────────────────────────
const swaggerDoc = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    customSiteTitle: 'Primetrade Task Manager API',
    customCss: '.swagger-ui .topbar { background-color: #0d1117; }',
  })
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: nodeEnv });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Central Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(port, () => {
    logger.info(`🚀  Server running on http://localhost:${port}  [${nodeEnv}]`);
    logger.info(`📄  Swagger docs: http://localhost:${port}/api-docs`);
  });
};

start();

module.exports = app; // for testing
