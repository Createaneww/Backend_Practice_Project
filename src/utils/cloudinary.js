import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        //file have successfully uploaded on cloudinary
        console.log("FIle is uploaded on cloudinary" , response.url);
        // fs.unlinkSync(localFilePath)
        return response //return the all the data from cloudinary eg - url of that file
    } catch (error) {
        fs.unlinkSync(localFilePath) // this will remove the locally saved temp file as upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}

