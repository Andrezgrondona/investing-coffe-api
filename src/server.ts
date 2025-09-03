import express from 'express';
import cors from 'cors';
import coffeeRoutes from './routes/coffeeRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', coffeeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Coffee Prices API is running',
    endpoints: {
      coffeePrices: '/api/coffee-prices',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Coffee prices endpoint: http://localhost:${PORT}/api/coffee-prices`);
});