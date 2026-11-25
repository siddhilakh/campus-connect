import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/companies.routes';
import placementRoutes from './routes/placements.routes';
import experienceRoutes from './routes/experiences.routes';
import questionRoutes from './routes/questions.routes';
import seniorRoutes from './routes/seniors.routes';
import resourceRoutes from './routes/resources.routes';
import notificationRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import readinessRoutes from './routes/readiness.routes';
import applicationRoutes from './routes/applications.routes';
import practiceRoutes from './routes/practice.routes';
import mentorshipRoutes from './routes/mentorship.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusConnect Central Backend REST API',
    institution: 'Medi-Caps University'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/seniors', seniorRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.url}`
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CampusConnect Backend Server Running on Port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

export default app;
