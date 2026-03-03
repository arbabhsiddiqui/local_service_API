
import { Router } from 'express'
import userController from '../controllers/user.controller.js'

const router = Router();


router.route("/register").get(userController.register)
router.route("/login").get(userController.login)


export default router
