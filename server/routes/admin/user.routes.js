import express from "express";

import * as userController from "../../controller/admin/user.controller.js";
import upgradeRequestRoutes from "./upgrade_request.routes.js";

const router = express.Router();

router.get("/list", userController.getUserList);

router.get("/total-page", userController.getTotalPage);

router.get("/:id", userController.getUserDetail);

router.post("/create", userController.createUserPost);

router.delete("/delete/:id", userController.deleteUser);

router.delete("/delete-list", userController.deleteUserList);

router.use(
  "/upgrade-requests",
  upgradeRequestRoutes
)

export default router;