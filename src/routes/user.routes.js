import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router()

router.route("/register").post(
    upload.fields([   //middleware he ye
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImg",
            maxCount: 1
        }
    ]),
    asyncHandler(registerUser)
)

export default router