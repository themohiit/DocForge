import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Rect, Text } from "react-konva";

// Ensure worker is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PdfViewer = () => {
  const viewportRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(""); // Track filename for backend
  const [textItems, setTextItems] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [editingText, setEditingText] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);

  const uploadFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Prepare for Backend Upload
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    // 2. Send file to backend /uploads folder
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    
    // 3. If successful, prepare for local rendering
    setFileName(data.fileName);
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    console.log("File uploaded and ready for editing");
  } catch (err) {
    console.error("Upload failed", err);
    alert("Could not upload file to server.");
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
    viewportHeightRef.current = viewport.height;
   
    viewportRef.current = viewport.scale;
   
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    setDimensions({ width: viewport.width, height: viewport.height });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const textContent = await page.getTextContent();
    const styles = textContent.styles;
    
    const items = textContent.items.map((item) => {
      const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      const fontStyle = styles[item.fontName];
      const fontSize = item.transform[0]; 
      const scaledFontSize = fontSize * viewport.scale;
      const calculatedHeight = item.height * viewport.scale;
      const yOffset = calculatedHeight * 0.1;

      return {
        id: Math.random().toString(36).substr(2, 9),
        text: item.str,
        originalText: item.str,
        x: x,
        y: y - scaledFontSize,
        width: item.width * viewport.scale,
        height: calculatedHeight,
        fontSize: item.height * viewport.scale,
        fontFamily: fontStyle ? fontStyle.fontFamily : "sans-serif",
        fontWeight: item.transform[0] !== item.transform[3] ? "bold" : "normal",
        fontName: item.fontName
      };
    });
    setTextItems(items);
  };

  // --- NEW: PHASE 4 BACKEND INTEGRATION ---
  const savePdf = async () => {
    const editedItems = textItems.filter(item => item.text !== item.originalText);
    
    if (editedItems.length === 0) {
      alert("No changes detected!");
      return;
    }

    setIsSaving(true);

    try {
     
      const response = await fetch('http://localhost:5000/api/save-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName,
          edits: editedItems.map(item => ({
            page: 1, // Currently supporting page 1
            x: item.x/Number(viewportRef.current),
            y: (viewportHeightRef.current - (item.y + item.height)) /1.5,
            newText: item.text,
            fontFamily: getSafeFont(item.fontFamily),
            fontSize: item.fontSize/Number(viewportRef.current),
            width: item.width/Number(viewportRef.current),
            height: item.height/Number(viewportRef.current)
          }))
        })
      });

      const data = await response.json();
      if (data.downloadUrl) {
        // Automatically trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', `edited_${fileName}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving PDF. Is the backend running?");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (newValue) => {
    if (!editingText) return;
    const updatedItems = textItems.map((item) => 
      item.id === editingText.id ? { ...item, text: newValue } : item
    );
    setTextItems(updatedItems);
    setEditingText(null);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>PDF Visual Editor</h2>
      <div style={{ marginBottom: "10px" }}>
        <input type="file" onChange={uploadFile} accept="application/pdf" />
        <button onClick={renderPdf} disabled={!fileUrl}>Render PDF</button>
        <button 
          onClick={savePdf} 
          disabled={isSaving || textItems.length === 0}
          style={{ marginLeft: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 15px", cursor: "pointer" }}
        >
          {isSaving ? "Processing..." : "Export & Download PDF"}
        </button>
      </div>

      <div style={{ position: "relative", border: "2px solid #333", display: "inline-block" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />

        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}
        >
          <Layer>
            {textItems.map((item) => {
              const isEdited = item.text !== item.originalText;
              return (
                <React.Fragment key={item.id}>
                  {isEdited && (
                    <Rect 
                      x={item.x} 
                      y={item.y} 
                      width={item.width} 
                      height={item.height} 
                      fill="white" 
                    />
                  )}

                  <Rect
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    fill={isEdited ? "transparent" : "rgba(0, 120, 255, 0.05)"}
                    stroke={isEdited ? "transparent" : "transparent"}
                    strokeWidth={1}
                    onClick={() => setEditingText(item)}
                    onMouseEnter={(e) => (e.target.getStage().container().style.cursor = "text")}
                    onMouseLeave={(e) => (e.target.getStage().container().style.cursor = "default")}
                  />

                  {isEdited && (
                    <Text
                      x={item.x}
                      y={item.y}
                      text={item.text}
                      fontSize={item.fontSize}
                      fontFamily="Helvetica, Arial, sans-serif"
                      fill="black"
                      listening={false}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>

        {editingText && (
          <input
            style={{
              position: "absolute",
              top: editingText.y,
              left: editingText.x,
              width: editingText.width,
              height: editingText.height,
              fontSize: `${editingText.fontSize}px`,
              fontFamily: "sans-serif",
              zIndex: 1000,
              outline: "2px solid #0078ff",
              background: "white",
              padding: 0,
              margin: 0,
            }}
            defaultValue={editingText.text}
            autoFocus
            onBlur={(e) => handleBlur(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBlur(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default PdfViewer;