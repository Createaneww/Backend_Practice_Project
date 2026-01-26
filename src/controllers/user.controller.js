import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req , res)=>{
    // res.status(200).json({
    //     success: true,
    //     message: "Parth-aur-code"
    // })

    //get user deatails like username , email , password etc from frontend
    //validation lagana padega like - not empty
    //check if user already exist : through username , email
    //check for images , check for avatar
    //upload them to cloudinary , avatar check on cloudinary
    //create a user object - create entry in db
    //remove password and refresh token field from res
    //check for user creation 
    //return res

    const {username , fullname , email , password} = req.body
    console.log("email is: " , email);
    console.log("Password is: " , password);

    

})


export {registerUser}