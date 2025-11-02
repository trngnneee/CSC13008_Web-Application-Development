import express from "express";
import * as userService from "../../service/user.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Client API of SnapBid!");
})

router.get("/users", async (req, res) => {
  const users = await userService.getAllUsers();
  console.log(users);
});

export default router;