import cron from "node-cron";
import { deleteExpiredVerifyTokens, deleteExpiredForgotPasswordTokens, downgradeExpiredSellers } from './user.service.js';

// Run every 2 minutes - delete expired tokens
cron.schedule("*/2 * * * *", async () => {
  try {
    const countEmailToken = await deleteExpiredVerifyTokens();
    const countForgotToken = await deleteExpiredForgotPasswordTokens();

    if (countForgotToken > 0) {
      console.log(`Đã xoá ${countForgotToken} forgot password token hết hạn`);
    }
    if (countEmailToken > 0) {
      console.log(`Đã xoá ${countEmailToken} verify email token hết hạn`);
    }
    
  } catch (error) {
    console.error("Cron error (delete tokens):", error);
  }
});

cron.schedule("0 * * * *", async () => {
  try {
    const count = await downgradeExpiredSellers();
    if (count > 0) {
      console.log(`Đã hạ ${count} seller(s) về bidder sau khi hết hạn 7 ngày`);
    }
  } catch (error) {
    console.error("Cron error (downgrade sellers):", error);
  }
});