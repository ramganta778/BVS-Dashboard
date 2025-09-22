const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const digitalAgreementRoutes = require('./routes/digitalAgreementRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware - IMPORTANT: Order matters!
app.use(cors());

// Debug middleware to check if body is being parsed
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  console.log('Request headers:', req.headers);
  next();
});

// Body parsing middleware - MUST come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to check parsed body
app.use((req, res, next) => {
  console.log('Parsed body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/digital-agreements', digitalAgreementRoutes);

// Test route with body parsing test
app.post('/api/test-body', (req, res) => {
  console.log('Test body:', req.body);
  res.json({
    success: true,
    body: req.body,
    message: 'Body parsing test successful'
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Busitron Dashboard API is running...'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware - MUST be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1431;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});