const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// In your Express route
const PdfToDocxController = async (req, res) => {
    const formData = new FormData();
    // Assuming you use 'multer' to handle the incoming PDF in Express
    formData.append('file', req.file.buffer, { filename: req.file.originalname });

    const response = await axios.post('http://127.0.0.1:8000/convert', formData, {
        headers: formData.getHeaders(),
        responseType: 'stream' // Best for Linux performance: stream the file
    });

    response.data.pipe(res); // Directly pipe the Python output to the React client
};

module.exports = PdfToDocxController;