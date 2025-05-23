export interface NearbySearchRequest {
    includedTypes: string[];
    maxResultCount: number;
    locationRestriction: {
        circle: {
            center: {
                latitude: number;
                longitude: number;
            }
            radius: number;
        }
    };
    rankPreference: "DISTANCE" | "POPULARITY";
}

export interface NearbySearchResponse {
    places: NearbySearchPlace[];
}


export interface NearbySearchPlace {
    displayName: string;
    formattedAddress: string;
}