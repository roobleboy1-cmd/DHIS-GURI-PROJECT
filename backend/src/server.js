import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import houseRoutes from './routes/houses.js';
import designRoutes from './routes/designs.js';
import engineerRoutes from './routes/engineers.js';
import workerRoutes from './routes/workers.js';
import requestRoutes from './routes/requests.js';
import projectRoutes from './routes/projects.js';
import projectProgressRoutes from './routes/projectProgress.js';
import projectDocumentsRoutes from './routes/projectDocuments.js';
import paymentRoutes from './routes/payments.js';
import favoriteRoutes from './routes/favorites.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
import healthRoutes from './routes/health.js';

let __dirname;
try { __dirname = path.dirname(fileURLToPath(import.meta.url)); } catch { __dirname = process.cwd(); }

const app = express();

// Trust reverse proxies (Render, Vercel, Railway, Cloudflare, AWS)
app.set('trust proxy', 1);

// CORS configuration for online and local access
app.use(cors({
  origin: (origin, callback) => {
    // Reflect origin to allow any frontend domain (Cloudflare tunnel, Vercel, Netlify, localhost)
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.options('*', cors());

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (For uptime monitors, Render health checks)
app.use('/api/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-progress', projectProgressRoutes);
app.use('/api/project-documents', projectDocumentsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'GURI DHIS - Construction ERP & House Management API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || Number(env.PORT) || 5001;
const HOST = '0.0.0.0';

if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, HOST, () => {
    console.log(`[GURI DHIS Server] listening on http://${HOST}:${PORT}`);
    console.log(`[Environment] ${env.NODE_ENV}`);
  });
}

export default app;
