const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (CORS_ORIGINS.length === 0) {
      if (NODE_ENV === 'production') {
        return callback(new Error('CORS_ORIGINS is not configured for production'));
      }
      return callback(null, true);
    }

    if (CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV
  });
});


app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Salesauto backend is running' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
