import express from "express";
import accountRoutes from "./account.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Admin API of SnapBid!");
})

router.use(
  "/account", 
  accountRoutes
)

export default router;