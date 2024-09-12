import express from 'express'
import { getTeacher, register } from '../controllers/teacher.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()


router.post('/register', register)
router.get('/get-teacher', getTeacher)



export default router