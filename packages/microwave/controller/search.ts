import { Request, Response } from 'express'
import { Product } from '../db/model'

export async function getSearchSuggestion(req: Request, res: Response) {
  const { query } = req.query

  if (typeof query !== 'string') {
    res
      .status(400)
      .send('Invalid query. Please send a plain string for search query')
    return
  }

  // return empty on empty query
  // TODO: should this return 4xx instead?
  if (!query) {
    res.status(200).json({ products: [] })
    return
  }

  const regexQuery = new RegExp(decodeURIComponent(query), 'i')

  // search products
  const products = await Product.distinct('name', { name: regexQuery })

  res.status(200).json({
    products
  })
}
