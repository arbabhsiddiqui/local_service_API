import { Router } from 'express'
import categoryController from '../controllers/category.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();




router.route("/")
    .get(verifyJWT, categoryController.getAll)
    .post(verifyJWT, categoryController.addItem)


router.route("/:id")
    .get(verifyJWT, categoryController.getById)
    .put(verifyJWT, categoryController.updateItem)
    .delete(verifyJWT, categoryController.deleteItem)



export default router
