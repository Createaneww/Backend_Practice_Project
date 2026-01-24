import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,   //cloudnary uRL
        required: true,
    },
    coverImg:{
        type: String //cloudnary url
    },
    watchHistory: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true , "Password is required"]
    },
    refreshToken:{
        type: String
    } 

},
{timestamps: true})

userSchema.pre("save" , async function (next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password , 10)
})


userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password/*enterred by user*/, this.password/*hashed pass jo db me he*/)  //return boolean value
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User" , userSchema)



