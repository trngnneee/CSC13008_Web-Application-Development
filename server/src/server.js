import './config/env.js';

import http from 'http';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import './cron/index.js';

const port = process.env.PORT || 10000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(port, () => {
  console.log(`API + Socket is running on port ${port}`);
});
