import express from "express"
import Userrouter from "./userRoutes/userRout.js"
const router = express.Router()
// all routes
router.use("/signupUser", Userrouter)



export default router