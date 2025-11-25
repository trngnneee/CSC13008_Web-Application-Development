import express from "express";
import userRoute from "./user.routes.js";
import accountRoutes from "./account.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Client API of SnapBid!");
})

router.use("/users", userRoute);

router.use(
  "/account",
  accountRoutes
)

export default router;