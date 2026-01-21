// require('dotenv').config({path: "./env"})
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();   // ← NO PATH

import connectDb from "./db/index.js";
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Database connected and your port is listening on the port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Connection failed with database" , error);
    
})





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