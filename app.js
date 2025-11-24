const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { errors } = require('celebrate');
const fs = require('fs');
const path = require('path');

const config = require('./src/config/config');
const { connect } = require('./src/config/mongoose');
const { expressLogger, expressErrorLogger, logger } = require('./src/utils/winston-logger');
const errorHandler = require('./src/utils/error-handler');

// Routes

const authRoutes = require('./src/routes/auth/auth.routes');
const profileRouter = require('./src/routes/profile/profile.route');
const categoryRouter = require('./src/routes/category/category.routes');
const setRouter = require('./src/routes/set/set.route');
const FilterGroupRouter = require('./src/routes/filter/filter-group.router');
const FilterValueRouter = require('./src/routes/filter/filter-value.router');
const assetRouter = require('./src/routes/asset/asset.route');

const app = express();

// Connect to database
connect();

// Ensure upload folder exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------
// Core Middleware (Simplified)
// --------------------------------------------------

// I18n Middleware for Language Detection
const i18nMiddleware = require('./src/middleware/i18n');
app.use(i18nMiddleware);

app.set('trust proxy', true);
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

// Logger middleware (optional - can remove if too verbose)
app.use(expressLogger);

// --------------------------------------------------
// Health Check Routes
// --------------------------------------------------
app.get('/', (req, res) => res.json({ message: req.t('home_page.welcome') }));
app.get(`/${config.server.route}/`, (req, res) => res.json({ message: req.t('api_page.welcome') }));
app.get(`/${config.server.route}/pingServer`, (req, res) => res.send(req.t('welcome_all')));
app.get('/health', (req, res) => res.status(200).json({ message: req.t('health_page.healthy') }));

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use(`/${config.server.route}/auth`, authRoutes);
app.use(`/${config.server.route}/profile`, profileRouter);
app.use(`/${config.server.route}/category`, categoryRouter);
app.use(`/${config.server.route}/set`, setRouter);
app.use(`/${config.server.route}/filter-groups`, FilterGroupRouter);
app.use(`/${config.server.route}/filter-values`, FilterValueRouter);
app.use(`/${config.server.route}/asset`, assetRouter);

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------
app.use((req, res, next) => {
  const error = new Error(errorHandler.ERROR_404 || 'Route not found');
  error.statusCode = 404;
  next(error);
});

// --------------------------------------------------
// Celebrate Validation Error Handler
// --------------------------------------------------
app.use(errors());

// --------------------------------------------------
// Custom Error Handler
// --------------------------------------------------
app.use(expressErrorLogger);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.statusCode || 500;

  const messageKey = err.messageKey || 'errors.internal_server_error';

  const translatedMessage = req.t(messageKey);

  logger.error(`${status} - ${translatedMessage}`, { stack: err.stack });

  res.status(status).json({
    result: 'error',
    code: status,
    desc: translatedMessage,
    stack: config.server.nodeEnv === 'prod' ? null : err.stack,
  });
});

process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`UncaughtException: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

module.exports = app;
