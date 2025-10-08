import dotenv from 'dotenv';
import express from 'express';
dotenv.config();
import { createClient } from '@supabase/supabase-js'
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

app.use(express.json());
app.use("/", (req, res) => {
    res.send("Hi");
});

console.log(supabase);

app.listen(port, () => {
    console.log(`Website đang chạy trên cổng ${port}`)
})