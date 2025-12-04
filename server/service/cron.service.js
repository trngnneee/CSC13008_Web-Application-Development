import cron from "node-cron";
import { deleteExpiredVerifyTokens, deleteExpiredForgotPasswordTokens } from './user.service.js';

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
    console.error("Cron error:", error);
  }
});