import express from 'express'
import { register } from '../controllers/teacher.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()


router.post('/register', register)



export default router