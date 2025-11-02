import express from "express";
import { registerPost } from "../../controller/admin/account.controller.js";

const router = express.Router();

router.post("/register", registerPost);

export default router;