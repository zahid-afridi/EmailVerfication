import express from 'express'
import { Reigster } from '../controllers/Auth.js'

const AuthRoutes=express.Router()

AuthRoutes.post('/register',Reigster)
export default AuthRoutes