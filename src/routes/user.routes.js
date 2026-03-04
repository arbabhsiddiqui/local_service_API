
import { Router } from 'express'
import userController from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router.route("/register").post(userController.register)
router.route("/login").post(userController.login)


router.route("/logout").post(verifyJWT, userController.logoutUser)
router.route("/refresh-token").post(userController.refreshAccessToken)


export default router
