import express from "express";

import authRouter from "./auth";
import googleMapRouter from "./google_map";
import { jwtController } from "../controller";

const router = express.Router();

// authentication
router.use("/api/v1/auth", authRouter);

// user profile
router.use("/api/v1/profile", jwtController.jwtAuthenticator, (req, res) => {
    res.status(200).json({
        message: "Profile",
        user: req.user,
    });
});

// google map
router.use("/api/v1/google_map", googleMapRouter)

export default router;
