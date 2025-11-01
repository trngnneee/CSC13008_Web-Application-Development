import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Admin API of SnapBid!");
})

export default router;