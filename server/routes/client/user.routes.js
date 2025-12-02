import express from "express";
import * as userController from "../../controller/admin/user.controller.js";
const router = express.Router();

router.get("/get-all-users", userController.getAllUsers);

export default router;