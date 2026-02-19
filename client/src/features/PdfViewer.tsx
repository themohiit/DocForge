import React, { useState, useRef,useEffect } from "react";
import type { ChangeEvent } from "react";
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
  const [fileUrl, setFileUrl] = useState<string|null>(null);

  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [editingText, setEditingText] = useState<TextItem|null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);


  useEffect(() => {
  if (fileUrl) {
    renderPdf();
  }
  // Cleanup the URL when the component unmounts or fileUrl changes
  return () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  };
}, [fileUrl]);


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


  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1. Store the actual File object in a ref or state to use later for Export
  setOriginalFile(file); 

  // 2. Create a local URL for PDF.js to read
  const url = URL.createObjectURL(file);
  setFileUrl(url);

  // 3. (Optional) Clear old data
  setTextItems([]);
  
  console.log("File loaded locally for editing");
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
    if (!originalFile) {
    alert("Original file missing. Please re-upload.");
    return;
  }

    setIsSaving(true);

    try {
        const edits:SaveEdit[]= editedItems.map((item:any) => ({
            page: 1, // Currently supporting page 1
            x: item.x/Number(viewportRef.current),
            // Backend Y calculation: PageHeight - Frontend_Y - ElementHeight
            y: (Number(viewportHeightRef.current) - (item.y + item.height)) /Number(viewportRef.current),
            newText: item.text,
            fontFamily: item.fontFamily ? item.fontFamily: getSafeFont(item.fontFamily),
            fontSize: item.fontSize/Number(viewportRef.current),
            width: item.width/Number(viewportRef.current),
            height: (item.height)/Number(viewportRef.current)
          }))

          // 1. Use FormData instead of a JSON body
            const formData = new FormData();
            formData.append('pdf', originalFile); // The File object from your state
            formData.append('edits', JSON.stringify(edits)); // The edit data as a string

      const response = await fetch('http://localhost:5000/api/save-pdf', {
        method: 'POST',
        
        body: formData,
      });


      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const newtab = window.open(downloadUrl, '_blank');
      if(!newtab){
        const link = document.createElement('a');
        link.href =downloadUrl;
        link.download = `edited_${originalFile.name}.pdf`;
        link.click();

      }
       setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
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
    <div className="p-5 mt-14 font-sans text-gray-800 w-[60vw]">
      <h2 className="text-2xl font-bold mb-4 text-white">PDF Editor</h2>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="file" className="block text-sm text-gray-600 
                 file:mr-4 file:py-2 file:px-4 
                 file:rounded-md file:border-0 
                 file:text-sm file:font-semibold 
                 file:bg-blue-50 file:text-blue-700 
                 hover:file:bg-blue-100 cursor-pointer" onChange={uploadFile} accept="application/pdf" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium 
                 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 
                 disabled:cursor-not-allowed transition-colors" onClick={renderPdf} disabled={!fileUrl}>Render PDF</button>
        <button 
          onClick={savePdf} 
          disabled={isSaving || textItems.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-md font-medium 
                 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 
                 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Processing..." : "Export & Download PDF"}
        </button>
      </div>

      <div className="relative border-2 border-gray-800  rounded-sm shadow-sm overflow-x-auto ">
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
              height: `${editingText.height+10}px`,
              fontSize: `${editingText.fontSize}px`,
              fontFamily: editingText.fontFamily,
              fontWeight: editingText.fontWeight,
              background: "white",
              color: "black",
              outline: "1px solid black",
              zIndex: 1000,
              padding: "0px 0px 10px 0px",
              whiteSpace: "nowrap",
              // overflow: "hidden",
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