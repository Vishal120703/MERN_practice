import express from "express"
import multer from "multer"
import fs from "fs";
import cloudinary from "./config/cloudinary.js";
const app = express();
const port = 3000;

app.use(express.json())

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"upload/");
    },
    filename:function(req,file,cb){
        const name = Date.now() + "-" + file.originalname;
        cb(null,name)
    }
})
const upload = multer({storage:storage});

app.get("/",(req,res)=>{ res.send("hello World");})

app.post("/",upload.single("pdf"),async(req,res)=>{
    try{
        let filepath;
    if(!req.file){
        return res.status(400).json({msg:"there is no file to upload"})
    }
    filepath = req.file.path;
    console.log(filepath);
    const result = await cloudinary.uploader.upload(filepath,{resource_type:"auto"})
    fs.unlinkSync(filepath);
    return res.status(200).json({msg:"file has been uploaded",url:result.secure_url});

    }
    catch (error) {
    console.log("ERROR:", error); 

    return res.status(500).json({
        msg: "Upload failed",
        err: error.message, 
    });
}
})

app.listen(port,()=>{
    console.log(`Server is Running on port : ${port}`);
})