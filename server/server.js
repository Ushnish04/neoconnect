import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import runEscalationJob from './utils/escalationJob.js';
import hubRoutes from './routes/hubRoutes.js';

dotenv.config();
connectDB();


const app = express();

app.set('trust proxy', 1); // ← move to top, before everything

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later'
});

app.use(cors({
  origin: ['https://neoconnect-puce.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // ← handle preflight for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({ message: 'NeoConnect API is running' });
});

// ← move ALL routes BEFORE the error handler
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hub', hubRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

runEscalationJob();