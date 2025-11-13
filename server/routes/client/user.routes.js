import express from "express";
import * as userService from "../../service/user.service.js";

const router = express.Router();

router.get("/get-all-users", async (req, res) => {
  const users = await userService.getAllUsers();
  console.log(users);
});

export default router;