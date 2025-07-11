import { Request, Response } from 'express'
import { GOOGLE_MAP_NEARBY_SEARCH_CONFIG } from '../const/google_map'
import { Product, Store } from '../db/model'

// fetches products near by the requested location.
// products are from stores that already exist in our db.
export async function getNearbyProducts(req: Request, res: Response) {
  const {
    lat,
    lng,
    distance = GOOGLE_MAP_NEARBY_SEARCH_CONFIG.RADIUS_METER,
    query
  } = req.query

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: 'latitude and longitude are required' })
  }

  const parsedLatitude = parseFloat(lat as string)
  const parsedLongitude = parseFloat(lng as string)
  const parsedDistance =
    typeof distance === 'number' ? distance : parseFloat(distance as string)


  // get stores within the distance specified. If not specified it'll use the
  // same distance used in nearby stores search
  const stores = await Store.find()
    .where('location')
    .within({
      center: [parsedLongitude, parsedLatitude],
      radius: parsedDistance / 6378137,
      spherical: true
    })

  // get products in the nearby stores
  const nearbyStoreIds = stores.map((store) => store._id)
  let productsQuery = Product.find({
    store: { $in: nearbyStoreIds }
  }).populate('store').populate({ path: 'poster', select: 'firstName lastName' })

  if (query && typeof query === 'string' && query.trim()) {
    const regexQuery = new RegExp(decodeURIComponent(query), 'i')
    // filter products that match the query
    productsQuery = productsQuery.find({ name: regexQuery })
  }

  const products = await productsQuery.exec()

  return res.status(200).json(products.map((product) => product.toJSON()))
}

export async function getProductByStore(req: Request, res: Response) {
  const { storeId } = req.query

  if (!storeId || typeof storeId !== 'string') {
    return res
      .status(400)
      .json({ error: 'invalid storeId provided'})
  }

  const products = await Product.find({
    store: storeId
  }).populate('store').populate({ path: 'poster', select: 'firstName lastName' })

  return res.status(200).json(products.map((product) => product.toJSON()))
}

export async function getProductById(req: Request, res: Response) {
  const { productId } = req.params

  if (!productId || typeof productId !== 'string') {
    return res
      .status(400)
      .json({ error: 'invalid productId provided'})
  }

  const product = await Product.findById(productId)
    .populate('store')
    .populate({ path: 'poster', select: 'firstName lastName' })

  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  return res.status(200).json(product.toJSON())
}
