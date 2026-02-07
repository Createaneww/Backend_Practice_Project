import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req , _ , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
    
        if(!token){
            throw new ApiError(401 , "Unauthorized request")
        }
        //agar token mil gya
        const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
       const user =  await User.findById(decodedToken?._id).select("-password -refreshToken")
       if(!user){
        throw new ApiError(401 , "Invalid Access-Token")
       }
    
       //if agar db me he 
       req.user = user;
       next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Access token")
    }
})