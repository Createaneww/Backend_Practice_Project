import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one whose is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, //one to whom subcriber is subscring
        ref: "User"
    }

} , {timestamps: true})


export const Subscription = mongoose.model("Subscription" , subscriptionSchema)