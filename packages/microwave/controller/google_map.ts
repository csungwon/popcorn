import { PlacesClient, protos } from '@googlemaps/places'
import { Request, Response } from 'express'
import { GOOGLE_MAP_NEARBY_SEARCH_CONFIG } from '../const/google_map'
import { Product, Store, StoreType } from '../db/model'

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAP_API_KEY
})

type GooglePlace = protos.google.maps.places.v1.Place

// fetches grocery stores based on the location given in the request
// it will first fetch nearby stores using Google Places API,
// and then it'll be matched to the stores registered in the db
// if the store does not exist in our database, new ones will be created
export const GetNearbyGroceryStores = async (req: Request, res: Response) => {
  const { lat, lng, query } = req.query

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: 'latitude and longitude are required' })
  }

  try {
    // Call Google Places API
    const fields = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.websiteUri'
    ]
    const [response] = await placesClient.searchNearby(
      {
        includedTypes: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.INCLUDED_TYPES,
        maxResultCount: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.MAX_RESULT_COUNT,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(lat as string),
              longitude: parseFloat(lng as string)
            },
            radius: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.RADIUS_METER
          }
        },
        rankPreference: GOOGLE_MAP_NEARBY_SEARCH_CONFIG.RANK_PREFERENCE
      },
      { otherArgs: { headers: { 'X-Goog-FieldMask': fields.join(',') } } }
    )
    const googlePlaces = response.places ?? []
    const googlePlaceIds = googlePlaces.map((place) => place.id)

    // get stores registered in the db
    const existingStores = await Store.find({
      googlePlaceId: { $in: googlePlaceIds }
    })

    console.debug(`Found ${existingStores.length} stores in the db`)

    // select google places to be registered in our db
    const existingStoreIds = new Set(
      existingStores.map((store) => store.googlePlaceId)
    )
    const storesToCreate: StoreType[] = googlePlaces
      .filter((place) => !existingStoreIds.has(place.id))
      .filter(
        // filter out google places with no displayName
        (place): place is GooglePlace & { displayName: { text: string } } =>
          !!place.displayName?.text
      )
      .map((place) => ({
        name: place.displayName.text,
        googlePlaceId: place.id,
        address: place.formattedAddress,
        iconUrl: getIconUrl(place),
        location: {
          type: 'Point',
          coordinates: [
            place.location?.longitude ?? 0,
            place.location?.latitude ?? 0
          ]
        }
      }))

    console.debug(`Creating ${storesToCreate.length} Stores...`)

    const newStores = await Store.insertMany(storesToCreate)

    // merge existing stores with the newly created stores
    let result = [...existingStores, ...newStores]

    // if query is provided, filter the stores that have products with the query
    if (query && typeof query === 'string' && query.trim()) {
      const regexQuery = new RegExp(decodeURIComponent(query), 'i')
      // filter existing stores that have products matching the query
      const storeIdsWithProduct = await Product.find({ name: regexQuery }).select('store').distinct('store')
      const storeIdsWithProductSet = new Set(storeIdsWithProduct.map(id => id.toString()))

      result = result.filter(store => storeIdsWithProductSet.has(store._id.toString()))
    }


    // sort by the order returned by the google result
    result.sort(
      (a, b) =>
        googlePlaceIds.indexOf(a.googlePlaceId) -
        googlePlaceIds.indexOf(b.googlePlaceId)
    )

    return res.status(200).json(result.map((store) => store.toJSON()))
  } catch (error) {
    if (error instanceof Error) {
      console.error('error fetching grocery stores:', error.message)
    } else {
      console.error('error fetching grocery stores:', error)
    }
    return res.status(500).json({ error: 'internal server error' })
  }
}

// free API resource for returning company icons.
// Frontend will validate the image url and decide whether to render fallback
function getIconUrl(place: GooglePlace) {
  try {
    const websiteUrl = new URL(place.websiteUri)
    return `https://logo.clearbit.com/${websiteUrl.host}`
  } catch {
    return ''
  }
}
