import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pitchRoutes from './routes/pitch.js';
import postRoutes from './routes/post.js';
import companyRoutes from './routes/company.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

// API Routes
app.use('/api/pitch', pitchRoutes);
app.use('/api/pitch', postRoutes);
app.use('/api/company', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({error: 'Not found'});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
