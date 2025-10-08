import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js'

const app = express();
const port = 3000;

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