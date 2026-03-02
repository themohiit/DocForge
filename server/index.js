const editorController = require('./controller/editor.js');
const express = require('express');
const PdfToDocxController = require('./controller/PdfToDocxController.js');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const compressorHandler = require('./controller/compressor.js');
const app = express();
app.use(cors());
app.use(express.json());



// Configure how to store uploaded files
const storage = multer.memoryStorage(); // Store files in memory for easy access istead of diskstorage
const upload = multer({ storage });



app.post('/api/save-pdf', upload.single('pdf'),editorController);

// app.post('/api/compress-pdf', upload.single('pdf'), compressorHandler); // Will implement after editor completion and docker knowledge acquisition
app.post('/api/compress-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const pdfBuffer = req.file.buffer;
  // Simulate compression by just returning the original file (for demonstration)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
  res.send(req.file.buffer);
});
app.post('/api/convertToDoc', upload.single('pdf'),PdfToDocxController);
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));