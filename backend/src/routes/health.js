import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  const health = await checkDatabaseHealth();

  res.status(200).json({
    status: 'ok',
    service: 'GURI DHIS API',
    timestamp: new Date().toISOString(),
    database: health.connected ? 'connected' : 'disconnected',
    engine: health.engine || null
  });
});

export default router;
