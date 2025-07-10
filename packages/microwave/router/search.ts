import express from 'express'
import { getSearchSuggestion } from '../controller/search'

const router = express.Router()

router.get('/suggestions', getSearchSuggestion)

export default router