import cron from "node-cron";
import db from "../config/database.config.js";

cron.schedule("*/5 * * * *", async () => {
  await db("forgot_password").where("expire_at", "<=", db.fn.now()).del();
});
