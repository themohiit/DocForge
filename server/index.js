const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// For this demo, we assume the original PDFs are stored in an 'uploads' folder
// In production, you might use S3 or a temporary buffer
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');

const multer = require('multer');

// Configure how to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// NEW: Endpoint to receive the file from frontend
app.post('/api/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "File uploaded successfully", fileName: req.file.originalname });
});

[UPLOADS_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

app.post('/api/save-pdf', async (req, res) => {
  try {
    const { fileName, edits } = req.body;
    const filePath = path.join(UPLOADS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Original file not found" });
    }

    // 1. Load the original PDF
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    
    // 2. Embed the Standard Font (Helvetica)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. Process Edits
    for (const edit of edits) {
      const { page: pageNum, x, y, newText, fontSize, width, height, fontFamily } = edit;
      console.log(fontFamily)
      // pdf-lib is 0-indexed
      const page = pages[pageNum - 1]; 
      const { height: pageHeight } = page.getSize();

      /**
       * COORDINATE CONVERSION:
       * PDF.js (Frontend) treats (0,0) as Top-Left.
       * pdf-lib (Backend) treats (0,0) as Bottom-Left.
       * * Formula: Backend_Y = PageHeight - Frontend_Y - ElementHeight
       */
   
      // Draw white rectangle to "erase" old text
      page.drawRectangle({
        x: x,
        y: y,
        width: width,
        
        height: height, // Small buffer to ensure coverage
        color: rgb(1, 1, 1), // White
      });

      // Draw the new text
      page.drawText(newText, {
        x: x,
        // y: backendY + (height * 0.1), // Slight adjustment for baseline
        y:y,
        size: fontSize,

        fontFamily: fontFamily,
        color: rgb(0, 0, 0), // Black
      });
    }

    // 4. Save and return file
    const pdfBytes = await pdfDoc.save();
    const outputFileName = `edited_${Date.now()}_${fileName}`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    
    fs.writeFileSync(outputPath, pdfBytes);

    // Provide the URL for download
    res.json({ 
      message: "PDF Processed", 
      downloadUrl: `http://localhost:5000/download/${outputFileName}` 
    });

  } catch (error) {
   
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// Serve the edited files
app.use('/download', express.static(OUTPUT_DIR));

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));