import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import clientRoutes from './routes/client/index.routes.js';
import adminRoutes from './routes/admin/index.routes.js';

const app = express();
const port = 10000;

app.use(cors({
    origin: [
        'http://localhost:3000'
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

app.listen(port, () => {
    console.log(`API is running on port ${port}`)
})