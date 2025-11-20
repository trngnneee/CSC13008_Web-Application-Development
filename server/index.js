import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import http from 'http';
import { Server } from 'socket.io';

import clientRoutes from './routes/client/index.routes.js';
import adminRoutes from './routes/admin/index.routes.js';

import * as socketService from './service/socket.service.js'
import { deleteExpiredVerifyTokens, deleteExpiredForgotPasswordTokens } from './service/user.service.js';

const app = express();
const port = 10000;

const server = http.createServer(app);
const io = new Server(server);

socketService.initSocket(io);

app.use(cors({
    origin: [
        'http://localhost:3000'
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

cron.schedule("*/5 * * * *", async () => {
  try {
    const countEmailToken = await deleteExpiredVerifyTokens();
    const countForgotToken = await deleteExpiredForgotPasswordTokens();

    if (countForgotToken > 0) {
      console.log(`🧹 Đã xoá ${countForgotToken} forgot password token hết hạn`);
    }
    if (countEmailToken > 0) {
      console.log(`🧹 Đã xoá ${countEmailToken} verify email token hết hạn`);
    }
    
  } catch (error) {
    console.error("Cron error:", error);
  }
});
    
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send("Welcome to SnapBid's API system!")
});
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

server.listen(port, () => {
    console.log(`API + Socket is running on port ${port}`)
})