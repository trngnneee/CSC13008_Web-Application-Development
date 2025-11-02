import db from "../config/database.config.js";

db.raw("select now()")
    .then(r => console.log("✅ DB connected:", r.rows?.[0] || r))
    .catch(err => console.error("❌ DB connect error:", {
        code: err.code,
        message: err.message,
        address: err.address,
        port: err.port
    }));

export function getAllUsers() {
    return db('user');
}