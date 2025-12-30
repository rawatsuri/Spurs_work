import './config/env.config';

import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { errorMiddleware } from './middlewares/error.middleware';
import { router } from './routers';

const app = express();

// Helmet
app.use(helmet());

// Json parser
app.use(express.json());

// Cors middleware
app.use(cors());

// Logger middleware
app.use(morgan('dev'));

// Serving static files (frontend build)
app.use(express.static(path.join(path.resolve(), 'public')));

// Routes
app.use('/api/v1', router);

// Error middleware
app.use(errorMiddleware);

// SPA fallback - serve index.html for any non-API routes (must be after API routes)
app.get('*', (req, res) => {
  const indexPath = path.join(path.resolve(), 'public', 'index.html');
  res.sendFile(indexPath);
});

app.listen(process.env.PORT, () => {
  console.log(chalk.cyan(`Server is running on http://localhost:${process.env.PORT}`));
});
