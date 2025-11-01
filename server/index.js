import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import clientRoutes from './routes/client/index.routes.js';
import adminRoutes from './routes/admin/index.routes.js';

const app = express();
const port = 10000;

dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to SnapBid's API system!")
});
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

app.listen(port, () => {
    console.log(`API is running on port ${port}`)
})