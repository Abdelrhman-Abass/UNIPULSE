import express from 'express'
import {  getUser, getUsers, updateUser } from '../controllers/users.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()


router.get('/get-users', getUsers)
router.get('/get-user/:id', verifyToken ,getUser )
router.put('/update-user/:id', verifyToken ,updateUser )


export default router