const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// In your Express route
const PdfToDocxController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: req.file.originalname });

        const response = await axios.post('http://127.0.0.1:8000/convert', formData, {
            headers: formData.getHeaders(),
            responseType: 'stream'
        });

        response.data.pipe(res);
    } catch (error) {
        console.error("Error in PdfToDocxController:", error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({ error: "Conversion failed on python service" });
        } else {
            res.status(500).json({ error: "Internal server error during conversion" });
        }
    }
};

module.exports = PdfToDocxController;