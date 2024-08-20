import express from 'express'
import { getUsers, login, logout, register, updateVerificationCode, verifyCode } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login )
router.post('/logout',logout )
router.post('/verify/:email',verifyCode )
router.post('/update-verify',updateVerificationCode )

router.get('/get-users', getUsers)




export default router