import { Router } from "express";
import { loginUser, logoutUser, registerUser , refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT , logoutUser)  //next() issliye use hote he taki next function pe shift ho skte
router.route("/refresh-token").post(refreshAccessToken)

export default router