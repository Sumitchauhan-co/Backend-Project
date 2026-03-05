import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error(`No file uploaded , ${error}`);
        }
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log(`File uploaded successfully, URL : ${result.url}`);
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        throw new Error(`Error : ${error}`);
        return null;
    }
};

export default uploadOnCloudinary;
