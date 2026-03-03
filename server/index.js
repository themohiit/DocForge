const editorController = require('./controller/editor.js');
const express = require('express');
const PdfToDocxController = require('./controller/PdfToDocxController.js');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const compressorHandler = require('./controller/compressorHandler.js');
const app = express();
app.use(cors());
app.use(express.json());



// Configure how to store uploaded files
const storage = multer.memoryStorage(); // Store files in memory for easy access istead of diskstorage
const upload = multer({ storage });



app.post('/api/save-pdf', upload.single('pdf'),editorController);
app.post('/api/compressPdf', upload.single('pdf'), compressorHandler);
app.post('/api/convertToDoc', upload.single('pdf'),PdfToDocxController);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));