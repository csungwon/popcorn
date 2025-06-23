export const GOOGLE_MAP_NEARBY_SEARCH_CONFIG = {
    INCLUDED_TYPES: ["grocery_store", "warehouse_store", "food_store", "supermarket"],
    MAX_RESULT_COUNT: 10,
    RADIUS_METER: 5000,
    RANK_PREFERENCE: "POPULARITY" as const,
}