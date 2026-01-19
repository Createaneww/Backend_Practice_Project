// require('dotenv').config({path: "./env"})
import dotenv from "dotenv";
dotenv.config();   // ← NO PATH

import connectDb from "./db/index.js";
connectDb();





//this is the first approach where we have connected to db in index.js file
/*
import express from 'express'
const app = express();

( async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       //sometimes our express app can't talk to the db so it gives a error
       app.on("Error" , (error)=>{
            console.log("ERROR" , error);
            throw error
       })

       app.listen(process.env.PORT , ()=>{
            console.log(`APP IS LISTENING ON PORT${process.env.PORT}`);
            
       })
    } catch (error) {
        console.error("ERROR: " , error)
    }
})()
*/