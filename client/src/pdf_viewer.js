import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Rect, Text } from "react-konva";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PdfViewer = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [textItems, setTextItems] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [editingText, setEditingText] = useState(null);
  const canvasRef = useRef(null);

  const uploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const getSafeFont = (pdfFontName) => {
  if (!pdfFontName) return "sans-serif";
  const name = pdfFontName.toLowerCase();
  if (name.includes("serif") && !name.includes("sans")) return "serif";
  if (name.includes("mono") || name.includes("courier")) return "monospace";
  return "sans-serif";
};
  const renderPdf = async () => {
    if (!fileUrl) return;
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    setDimensions({ width: viewport.width, height: viewport.height });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const textContent = await page.getTextContent();
    const styles = textContent.styles; // This is the dictionary of font metadata
    console.log(styles);
    const items = textContent.items.map((item) => {
      const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      const fontStyle = styles[item.fontName];

      // PDF.js Y is often the baseline. 
      // We subtract height to get the "top", but adding a tiny 
      // buffer (approx 10% of height) often fixes the "too high" issue.
      const calculatedHeight = item.height * viewport.scale;
      const yOffset = calculatedHeight * 0.1; // Small buffer adjust

      return {
        id: Math.random().toString(36).substr(2, 9), // Unique ID for easier mapping
        text: item.str,
        originalText: item.str, // Store original to detect changes
        x: x,
        y: y - calculatedHeight + yOffset,
        width: item.width * viewport.scale,
        height: item.height * viewport.scale,
        fontSize: item.height * viewport.scale,

          // NEW: Store the exact CSS font-family from the PDF
        fontFamily: fontStyle ? fontStyle.fontFamily : "sans-serif",
        // Optional: capture if the font is bold or italic from the transform matrix
        fontWeight: item.transform[0] !== item.transform[3] ? "bold" : "normal",
        fontName: item.fontName
      };
    });
    setTextItems(items);
  };

  const handleBlur = (newValue) => {
    if (!editingText) return;
    const updatedItems = textItems.map((item) => 
      item.id === editingText.id ? { ...item, text: newValue } : item
    );
    setTextItems(updatedItems);
    setEditingText(null);
  };

  // ... (keep your imports and state as they are)

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" onChange={uploadFile} accept="application/pdf" />
      <button onClick={renderPdf}>Render & Analyze</button>

      {/* CRITICAL: Ensure this container is relative so the absolute 
         children (Canvas, Stage, Input) stay aligned to the PDF.
      */}
      <div style={{ position: "relative", marginTop: "20px", display: "inline-block" }}>
        
        {/* Layer 1: PDF Background */}
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc", display: "block" }} />

        {/* Layer 2: Konva Interactive Layer */}
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }} // zIndex 10
        >
          <Layer>
            {textItems.map((item) => {
              const isEdited = item.text !== item.originalText;
              return (
                <React.Fragment key={item.id}>
                  {/* The White Patch */}
                  {isEdited && (
                    <Rect 
                      x={item.x} 
                      y={item.y} 
                      width={item.width} 
                      height={item.height*1.25} 
                      fill="white" 
                    />
                  )}

                  {/* The Clickable Hitbox */}
                  <Rect
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height+2}
                    fill="transparent"
                    onClick={() => {
                      console.log("Setting editing text for:", item); // Debug Log
                      setEditingText(item);
                    }}
                    onMouseEnter={(e) => (e.target.getStage().container().style.cursor = "text")}
                    onMouseLeave={(e) => (e.target.getStage().container().style.cursor = "default")}
                  />

                  {/* The Updated Text */}
                  {isEdited && (
                    <Text
                      x={item.x}
                      y={item.y}
                      text={item.text}
                      // width={editingText.width} 
                      // height={editingText.height}
                      fontSize={item.fontSize}
                      fontWeight={item.fontWeight}    
                      fontFamily={`${item.fontName}, ${getSafeFont(item.fontName)}`}
                      fill="black"
                      listening={false} // Important: clicks pass through this
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>

        {/* Layer 3: The HTML Input Box */}
        {editingText && (
          <input
            key={editingText.id} // Forces re-render when switching items
            style={{
              position: "absolute",
              top: editingText.y,
              left: editingText.x,
              width: editingText.width || "20px",
              height: Math.max(editingText.height,20),
              fontSize: `${editingText.fontSize}px`,
              fontFamily:editingText.fontFamily,
              fontStyle:editingText.fontStyle,
              border: "2px solid #000000ff", // Thicker blue border
              zIndex: 1000, // Much higher than the Stage
              outline: "none",
              background: "white",
              padding: 0,
              margin: 0,
              color: "black",
              display: "block"
            }}
            defaultValue={editingText.text}
            autoFocus
            onBlur={(e) => handleBlur(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {handleBlur(e.target.value)
                
              };
              if (e.key === "Escape") setEditingText(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
export default PdfViewer;