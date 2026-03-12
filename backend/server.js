const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduattend';
let dbConnected = false;

console.log('🔄 Connecting to MongoDB...');
console.log(`📍 URI: ${mongoUri}`);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  dbConnected = true;
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('⚠️ Retrying in 5 seconds...');
  setTimeout(() => {
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      dbConnected = true;
      console.log('✅ MongoDB connected on retry');
    })
    .catch(err => {
      console.error('❌ MongoDB connection failed again:', err.message);
      console.log('⚠️ Running without database - data will not persist');
    });
  }, 5000);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    database: dbConnected ? 'connected' : 'disconnected',
    mongoUri: mongoUri,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`\n📱 Mobile App: npm start in mobile-app folder`);
  console.log(`\n💾 Database: ${dbConnected ? 'Connected' : 'Connecting...'}\n`);
});
