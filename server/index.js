import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/client/index.routes.js';
import adminRoutes from './routes/admin/index.routes.js';

import http from 'http';
import { Server } from 'socket.io';
import * as socketService from './service/socket.service.js'

const app = express();
const port = 10000;

const server = http.createServer(app);
const io = new Server(server);

socketService.initSocket(io);

app.use(cors({
    origin: [
        process.env.FRONTEND_URL
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send("Welcome to SnapBid's API system!")
});
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

server.listen(port, () => {
    console.log(`API + Socket is running on port ${port}`)
})