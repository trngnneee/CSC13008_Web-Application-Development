import { Server } from 'socket.io';
import registerCommentHandlers from './comment.socket.js';
import registerProductHandlers from './product.socket.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    registerCommentHandlers(io, socket);
    registerProductHandlers(io, socket);

    socket.on('disconnect', () => {
      // cleanup if needed
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
