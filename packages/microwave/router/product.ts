import express, { Request, Response } from "express";
import { getNearbyProducts, getProductByStore } from '../controller/product';

const router = express.Router();

router.get('/byStore', (req: Request, res: Response, next) => {
  getProductByStore(req, res).catch(next)
})

router.get('/', (req: Request, res: Response, next) => {
  getNearbyProducts(req, res).catch(next)
})



export default router