import express from "express";
import { GoogleMapController } from "../controller";

const router = express.Router();

router.get("/nearby_grocery_stores", (req, res, next) => {
    GoogleMapController.GetNearbyGroceryStoresFromGoogleMaps(req, res).catch(next);
});


export default router;