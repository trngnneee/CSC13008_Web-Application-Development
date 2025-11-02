import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

export default knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 10 },
});
