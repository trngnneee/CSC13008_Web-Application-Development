import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import corsOptions from './config/cors.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import clientRoutes from './routes/client/index.routes.js';
import adminRoutes from './routes/admin/index.routes.js';

const app = express();

// Core middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Root
app.get('/', (_req, res) => {
  res.send("Welcome to SnapBid's API system!");
});

// API routes
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handler (must be after routes)
app.use(errorHandler);

export default app;
