const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function editorController(req, res) {
    try {
        if(!req.file) {
          return res.status(400).json({ error: "No PDF file uploaded" });
        }
    
        const pdfBuffer = req.file.buffer;
        const edits = JSON.parse(req.body.edits);
    
        const pdfDoc = await PDFDocument.load(pdfBuffer);
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
          console.log(fontSize)
          const heightBuffer = height * 0.2; 
          const totalHeight = height + heightBuffer;
          /**
           * COORDINATE CONVERSION:
           * PDF.js (Frontend) treats (0,0) as Top-Left.
           * pdf-lib (Backend) treats (0,0) as Bottom-Left.
           * * Formula: Backend_Y = PageHeight - Frontend_Y - ElementHeight
           */
          
          // Draw white rectangle to "erase" old text
          if(fontSize<=14){
            page.drawRectangle({
            x: x,
            y: y-3,
            width: width,
            
            
            height: height, // Small buffer to ensure coverage
            color: rgb(1,1,1), // White
          });}
          else{
            page.drawRectangle({
            x: x,
            y: y-3,
            width: width,
            
            
            height: height, // Small buffer to ensure coverage
            color: rgb(1,1,1), // White
          });
          }
    
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
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=edited.pdf`);
        
        // Convert Uint8Array to Buffer for Express res.send
        res.send(Buffer.from(pdfBytes));
      } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Failed to process PDF" });
      }
    }

module.exports = editorController;