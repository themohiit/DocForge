const axios = require('axios');
const FormData = require('form-data');

const CompressorHandler = async (req, res) =>{
    const formData = new FormData();
    formData.append('file', req.file.buffer, {filename: req.file.originalname});
    const powerLevel = req.body.powerLevel || 2; 

    try{const response = await axios.post(`http://0.0.0.0:8000/compress?power=${powerLevel}`,formData, {
        headers: formData.getHeaders(),
        responseType: 'stream'
    });

    response.data.pipe(res);}
    catch(error){
        console.error("Error in CompressorHandler:", error);    
        res.status(500).json({ error: "Compression failed" });
}
};

module.exports = CompressorHandler;
