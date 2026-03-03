import { Router } from "express";
import userTypeController from "../controllers/userType.controller.js";




const router = Router()



router.route("/")
    .get(userTypeController.getAll)
    .post(userTypeController.addItem)


router.route("/:id")
    .get(userTypeController.getById)
    .put(userTypeController.updateItem)
    .delete(userTypeController.deleteItem)





export default router