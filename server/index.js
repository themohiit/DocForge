const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
app.use(cors());
app.get("/",(req,res)=>{
   res.send("pong");
})

const uploads = multer({dest:"uploads/"})
app.post("/uploads",uploads.single("pdf"),(req,res)=>{
    res.json({
        filename:req.file.filename
    });
    
})

app.get("/pdf/:name",(req,res)=>{
    const filePath = path.join(__dirname,"uploads",req.params.name);
    res.sendFile(filePath);
})
app.listen(4000,()=>{
    console.log("http://localhost:4000/");
});