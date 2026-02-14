import React, { useState, useRef, type ChangeEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Rect, Text } from "react-konva";

import type { KonvaEventObject } from "konva/lib/Node";

// Ensure worker is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface TextItem {
        id: string;
        text: string;
        originalText: string;
        x:  number;
        y: number;
        width: number;
        height: number;
        fontSize: number;
        fontFamily:  string;
        fontWeight: string;
        fontName: string;
}

interface Dimensions {
  width: number;
  height: number;}

interface SaveEdit {
  page: number;
  x: number;
  y: number;
  newText: string;
  fontFamily: string;
  fontSize: number;
  width: number;
  height: number;
}

const PdfViewer :React.FC = () => {
  const editSpanRef = useRef<HTMLSpanElement | null>(null);
  const viewportRef = useRef<Number>(1.5);
  const viewportHeightRef = useRef<Number>(0);
  const [fileUrl, setFileUrl] = useState<String|null>(null);
  const [fileName, setFileName] = useState<String>(""); // Track filename for backend
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [editingText, setEditingText] = useState<TextItem|null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);

  React.useEffect(() => {
  if (editingText && editSpanRef.current) {
    editSpanRef.current.focus();
    
    // Move cursor to the end of the text
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editSpanRef.current);
    range.collapse(false); // false means move to end
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}, [editingText]);
  const uploadFile = async (e:ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
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

  const getSafeFont = (pdfFontName:string) => {
    if (!pdfFontName) return "sans-serif";
    const name = pdfFontName.toLowerCase();
    if (name.includes("serif") && !name.includes("sans")) return "serif";
    if (name.includes("mono") || name.includes("courier")) return "monospace";
    return "sans-serif";
  };
  
  const renderPdf = async () => {
    if (!fileUrl|| !canvasRef.current) return;
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    viewportHeightRef.current = viewport.height;
   
    viewportRef.current = viewport.scale;
   
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if(!context) return;

    setDimensions({ width: viewport.width, height: viewport.height });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    
    await page.render({ 
        canvasContext: context, 
        viewport:viewport,
        canvas: canvas
     }).promise;

    const textContent = await page.getTextContent();
    const styles = textContent.styles;
    
    const items:TextItem[] = textContent.items.map((item:any) => {
      const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      const fontStyle = styles[item.fontName];
      const fontSize = item.transform[0]; 
      const scaledFontSize = fontSize * viewport.scale;
      const calculatedHeight = item.height * viewport.scale;
      const fontName = item.fontName.toLowerCase();
      const isBold = fontName.includes("bold") || 
                 fontName.includes("black") || 
                 fontName.includes("heavy") || 
                 fontName.includes("w7") || // Common in some font weights
                 item.transform[0] > item.height * 1.1; // Fallback: horizontal scale is thick

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
        fontWeight: isBold ? "bold" : "bold",
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
        const edits:SaveEdit[]= editedItems.map((item:any) => ({
            page: 1, // Currently supporting page 1
            x: item.x/Number(viewportRef.current),
            y: (Number(viewportHeightRef.current) - (item.y + item.height)) /Number(viewportRef.current),
            newText: item.text,
            fontFamily: item.fontFamily ? item.fontFamily: getSafeFont(item.fontFamily),
            fontSize: item.fontSize/Number(viewportRef.current),
            width: item.width/Number(viewportRef.current),
            height: (item.height)/Number(viewportRef.current)
          }))
      const response = await fetch('http://localhost:5000/api/save-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fileName,
          edits
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

  const handleBlur = (newValue:string|null) => {
    if (!editingText || newValue === null) return;
    const updatedItems = textItems.map((item) => 
      item.id === editingText.id ? { ...item, text: newValue } : item
    );
    setTextItems(updatedItems);
    setEditingText(null);
  };

    const handleMouseEnter =(e:KonvaEventObject<MouseEvent>) => {
        const container = e.target.getStage()?.container();
        if(container)
        container.style.cursor = "text";
        };

    const handleMouseLeave =(e:KonvaEventObject<MouseEvent>) => {
        const container = e.target.getStage()?.container();
        if(container)
        container.style.cursor = "default";
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
                      height={item.height+7} 
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
                    onClick={() => {
                        setEditingText(item)
                        console.log(`fontfamily: ${item.fontFamily},
                             fontsize:${item.fontSize},
                             fontweight: ${item.fontWeight}`)
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />

                  {isEdited && (
                    <Text
                      x={item.x}
                      y={item.y}
                      text={item.text}
                      fontSize={item.fontSize}
                      fontFamily= 'sans-serif'
                      fontWeight= 'bold'
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
          // Replace <input /> with this for a more "natural" feel
          <span
            ref={editSpanRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              position: "absolute",
              top: editingText.y,
              left: editingText.x,
              minWidth: `${editingText.width}px`, // Starts at original width
              height: `${editingText.height}px`,
              fontSize: `${editingText.fontSize}px`,
              fontFamily: editingText.fontFamily,
              fontWeight: editingText.fontWeight,
              background: "white",
              color: "black",
              outline: "1px solid black",
              zIndex: 1000,
              padding: "0px 0px 10px 0px",
              whiteSpace: "nowrap",
            }}
            onBlur={(e) => handleBlur(e.currentTarget.textContent)}
            onKeyDown={(e:React.KeyboardEvent<HTMLSpanElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleBlur(e.currentTarget.textContent);
              }
            }}
          >
            {editingText.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;