//  will build after edtior complition bcoz require docker knowledge 

const { PDFDocument } = require('pdf-lib');

async function compressorHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfBuffer = req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Simulate compression by just returning the original file (for demonstration)
    const compressedPdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(compressedPdfBytes);
  } catch (error) {
    console.error('Error compressing PDF:', error);
    res.status(500).json({ error: 'Failed to compress PDF' });
  }
}

module.exports = compressorHandler;
