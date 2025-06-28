import express from "express";

import { GoogleMapController, jwtController } from "../controller";
import authRouter from "./auth";
import productRouter from './product';

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

// nearby stores
router.get("/api/v1/nearby_stores", (req, res, next) => {
    GoogleMapController.GetNearbyGroceryStores(req, res).catch(next);
})

// products
router.use('/api/v1/product', productRouter)

export default router;
