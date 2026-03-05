import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    userController.registerUser
);

router.post("/login", userController.loginUser);

router.post("/logout", verifyJWT, userController.logoutUser);

router.post("/refresh-token", userController.refreshAccessToken)

export default router;
