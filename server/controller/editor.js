const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function editorController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded" });
        }

        const pdfBuffer = req.file.buffer;
        const edits = JSON.parse(req.body.edits);

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        // --- HELPER FUNCTIONS ---
        
        // Helper to map styles to Standard Fonts
        async function getFontObject(doc, family, weight, style) {
            let fontName = StandardFonts.Helvetica;
            const isBold = weight === 'bold' || weight >= 700;
            const isItalic = style === 'italic' || style === 'oblique';

            const fam = (family || 'helvetica').toLowerCase();

            if (fam.includes('times')) {
                if (isBold && isItalic) fontName = StandardFonts.TimesRomanBoldItalic;
                else if (isBold) fontName = StandardFonts.TimesRomanBold;
                else if (isItalic) fontName = StandardFonts.TimesRomanItalic;
                else fontName = StandardFonts.TimesRoman;
            } else if (fam.includes('courier')) {
                if (isBold && isItalic) fontName = StandardFonts.CourierBoldOblique;
                else if (isBold) fontName = StandardFonts.CourierBold;
                else if (isItalic) fontName = StandardFonts.CourierOblique;
                else fontName = StandardFonts.Courier;
            } else {
                // Default Sans-Serif (Helvetica/Arial)
                if (isBold && isItalic) fontName = StandardFonts.HelveticaBoldOblique;
                else if (isBold) fontName = StandardFonts.HelveticaBold;
                else if (isItalic) fontName = StandardFonts.HelveticaOblique;
                else fontName = StandardFonts.Helvetica;
            }
            return await doc.embedFont(fontName);
        }

        function hexToRgb(hex = "#000000") {
            // Remove # if present
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
            const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
            const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
            return rgb(r, g, b);
        }

        // --- MAIN EDIT LOOP ---

        for (const edit of edits) {
            const { 
                page: pageNum, x, y, newText, fontSize, 
                width, height, fontFamily, fontWeight, 
                fontStyle, textDecoration, fill 
            } = edit;

            const page = pages[pageNum - 1];
            if (!page) continue;

            // 1. Get the actual Font Object
            const font = await getFontObject(pdfDoc, fontFamily, fontWeight, fontStyle);
            const textColor = hexToRgb(fill);

            // 2. Erase old text area (White Rectangle)
            page.drawRectangle({
                x: x,
                y: y - 2, // Slight offset to ensure full coverage
                width: width,
                height: height + 2,
                color: rgb(1, 1, 1), 
            });

            // 3. Draw new text
            page.drawText(newText, {
                x: x,
                y: y,
                size: fontSize,
                font: font,
                color: textColor,
            });

            // 4. Handle Underline manually
            if (textDecoration === 'underline') {
                const textWidth = font.widthOfTextAtSize(newText, fontSize);
                page.drawLine({
                    start: { x: x, y: y - 1 },
                    end: { x: x + textWidth, y: y - 1 },
                    thickness: 1,
                    color: textColor,
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=edited.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
}

module.exports = editorController;