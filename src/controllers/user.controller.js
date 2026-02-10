
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating refresh tokens")
    }
}

const registerUser = asyncHandler( async (req , res , next)=>{
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


//Login funtion
const loginUser = asyncHandler( async(req , res )=>{
    //req.body se email , password lenge user se
    //agar email/password nhi milta to bolenge both fields are required
    //find the user in db
    //password check
    //if true password then generate access and refresh token and 
    // send cookie


    //step1 - req.body se email , password lenge user se
    const {username , email , password} = req.body

    //step2 - validate
    if(!(username || email)){
        throw new ApiError(400 , "Username or Email is required")
    }

    //step3 - find the user in db
   const user =  await User.findOne({
        $or: [ {username} , {email} ]
    })
    //if user not found
    if(!user){
        throw new ApiError(404 , "User does not exist , Please register!!!")
    }

    //if user exist then
    //step4 password check humne models file me method banaya he isPasswordCorrect
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid user credentials")
    }

    //step5 - if true password then generate access and refresh token
    const {accessToken , refreshToken} = await generateAccessandRefreshTokens(user._id)

    //user ko password aur refreshToken nhi bhejna
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //step6 - cookies
    const options = {
        httpOnly: true,  //iska matlab is cookies sirf server se hi manage hogi
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , 
            {
                user: loggedInUser , accessToken , refreshToken
            },
            "User logged in successfully"
        )
    )
    

})


//logout fucntion
const logoutUser = asyncHandler(async(req , res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,  //iska matlab is cookies sirf server se hi manage hogi
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User loggedOut"))
})


const refreshAccessToken = asyncHandler(async(req , res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //agar nhi mila too
    if (!incomingRefreshToken) {
        throw new ApiError(401 , "Unauthorized request")
    }
   try {
     //agar mil gaya too
     const decodedToken =  jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id)
 
     if(!user){
         throw new ApiError(401 , "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401 , "Refresh token is expired or used")
     }
 
     //cookies me bhejna he to options to rakhne padega
     const options = {
         httpOnly: true,
         secure: true
     }
     const {accessToken , newRefreshToken} = await generateAccessandRefreshTokens(user._id)
     
     return res
     .status(200)
     .cookie("accessToken" , accessToken , options)
     .cookie("refreshToken" , newRefreshToken , options)
     .json(
         200 , 
         {accessToken , refreshToken: newRefreshToken},
         "accessToken refreshed successfully"
     )
   } catch (error) {
    throw new ApiError(401 , error?.message || "invalid refresh tOken")
   }
})


const changeCurrentPassword = asyncHandler(async(req , res)=>{

    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid old Passwrod")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    
    return res
    .status(200)
    .json(201 , {} , "Password changed successfully")
})


//get current user
const getCurrentUser = asyncHandler(async(res , req) =>{
    return res
    .status(200)
    .json(200 , req.user , "current user fetched successfully")
})

//update user details like fullname , email
const updateAccountDeltails = asyncHandler(async(req , res) => {
    const {fullname , email} = req.body

    if(!fullname || !email){
        throw new ApiError(400 , "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated successfully"))
})

//updated user avatar
const updateUserAvatar = asyncHandler(async(req , res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400 , "error while uploading the avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Avater updated successfully"))
})

//updated user coverImg
const updateUserCoverImg = asyncHandler(async(req , res)=>{
    const coverImgLocalPath = req.file?.path
    
    if(!coverImgLocalPath){
        throw new ApiError(400 , "CoverImg file is missing")
    }

    const coverImg = await uploadOnCloudinary(coverImgLocalPath)
    if(!coverImg.url){
        throw new ApiError(400 , "error while uploading the coverImg")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImg: coverImg.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "CoverImg updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDeltails,
    updateUserAvatar,
    updateUserCoverImg
}