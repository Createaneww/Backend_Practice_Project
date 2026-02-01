
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req , res)=>{
    //get user deatails like username , email , password etc from frontend
    //validation lagana padega like - not empty
    //check if user already exist : through username , email
    //check for images , check for avatar
    //upload them to cloudinary , avatar check on cloudinary
    //create a user object - create entry in db
    //remove password and refresh token field from res
    //check for user creation 
    //return res

    //1  - get user deatails like username , email , password etc from frontend
    const {username , fullname , email , password} = req.body
    
    //2 - validation lagana padega like - not empty
    //checking for fullname method-1
    // if(fullname === ""){
    //     throw new ApiError(400 , "fullname is required")
    // }
    //method-2
    if (
        [fullname , username , email , password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400 , "all fields are complusary")
    }

    //3 - check if user already exist : through username , email
    const existedUser = await User.findOne({
        $or: [ {username} , {email} ]
    })
    if(existedUser){
         throw new ApiError(409 , "User with email and username already exist")
    }

    //4 - check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path 
    const coverImgLocalPath = req.files?.coverImg[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is complusary")
    }

    //5 - upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)
    //avatar check on cloudinary
    if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
    }

    //6 - create a user object - create entry in db
    const user =  await User.create({
        fullname,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //check if database me user bana he ya nhi
    //7 - then.select se remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //ye ye cheeze nhi chahoye
    )
    //8 - check for user creation
    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user")
    }
    
    //9 - return the response
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )

})


export {registerUser}