import { Request, Response } from "express";
import { NearbySearchRequest, NearbySearchPlace } from "../types/google_map";
import { GOOGLE_MAP_NEARBY_SEARCH_CONFIG } from "../const/google_map";
import axios from "axios";

export const GetNearbyGroceryStoresFromGoogleMaps = async (req: Request, res: Response) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "latitude and longitude are required" });
    }

    try {
        const request: NearbySearchRequest = {
            includedTypes: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.INCLUDED_TYPES,
            maxResultCount: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.MAX_RESULT_COUNT,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: parseFloat(lat as string),
                        longitude: parseFloat(lng as string),
                    },
                    radius: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.RADIUS_METER,
                },
            },
            rankPreference: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.RANK_PREFERENCE,
        };

        const headers = {
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
            "X-Goog-Api-Key": process.env.GOOGLE_MAP_API_KEY,
        };

        const response = await axios.post("https://places.googleapis.com/v1/places:searchNearby", request, { headers });

        const groceryStores = response.data.places.map((place: NearbySearchPlace) => ({
            name: place.displayName,
            address: place.formattedAddress,
        }));

        return res.status(200).json(groceryStores);
    } catch (error) {
        if (error instanceof Error) {
            console.error("error fetching grocery stores:", error.message);
        } else {
            console.error("error fetching grocery stores:", error);
        }
        return res.status(500).json({ error: "internal server error" });
    }
};
