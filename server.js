const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const callRoutes = require('./routes/callRoutes');
const { setupSocket } = require('./socket/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, messageLimiter } = require('./middleware/rateLimitMiddleware');
const logger = require('./services/loggerService');

dotenv.config();

configureCloudinary();
connectDB();
const { migrateWorkspaceMembers } = require('./config/migrate');
setTimeout(migrateWorkspaceMembers, 2000);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://team-collaboration-ruby.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rewrite requests missing /api prefix
app.use((req, res, next) => {
  const prefixes = ['/auth', '/workspace', '/channel', '/message', '/upload', '/invite', '/notification', '/ai', '/payment', '/call'];
  if (prefixes.some((p) => req.path.startsWith(p)) && !req.path.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workspace', apiLimiter, workspaceRoutes);
app.use('/api/channel', apiLimiter, channelRoutes);
app.use('/api/message', messageLimiter, messageRoutes);
app.use('/api/upload', apiLimiter, uploadRoutes);
app.use('/api/invite', apiLimiter, inviteRoutes);
app.use('/api/notification', apiLimiter, notificationRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/call', callRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, 'client', 'dist');
  const fs = require('fs');
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return notFound(req, res, () => {});
      }
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  } else {
    logger.warn('client/dist not found — serving API only');
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return notFound(req, res, () => {});
      }
      res.redirect(process.env.FRONTEND_URL || 'https://team-collaboration.vercel.app');
    });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Team Collaboration API running', status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server running on port ${PORT}`);
});
