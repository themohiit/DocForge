const axios = require('axios');
const FormData = require('form-data');

const CompressorHandler = async (req, res) =>{
    try{
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, {filename: req.file.originalname});
        const powerLevel = Number(req.body.powerLevel) || 2; 

        const response = await axios.post(`http://127.0.0.1:8000/compress?power=${powerLevel}`,formData, {
            headers: formData.getHeaders(),
            responseType: 'stream'
        });

        response.data.pipe(res);
    }
    catch(error){
        console.error("Error in CompressorHandler:", error.message);    
        if (error.response) {
            res.status(error.response.status).json({ error: "Compression failed on python service" });
        } else {
            res.status(500).json({ error: "Internal server error during compression" });
        }
    }
};

module.exports = CompressorHandler;
