import { Router } from 'express'
import serviceController from '../controllers/service.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();




router.route("/")
    .get(verifyJWT, serviceController.getAll)
    .post(verifyJWT, serviceController.addItem)


router.route("/:id")
    .get(verifyJWT, serviceController.getById)
    .put(verifyJWT, serviceController.updateItem)
    .delete(verifyJWT, serviceController.deleteItem)



export default router
