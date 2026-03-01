import { useState, useRef, useEffect } from "react";
import * as React from "react";
import type { ChangeEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Toolbar from "./toolbar";


// Ensure worker is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface TextItem {
  id: string;
  text: string;
  originalText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontName: string;
  fontStyle: string;
  textDecoration?: string;
  fill?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

interface SaveEdit {
  page: number;
  x: number;
  y: number;
  newText: string;
  fontFamily: string;
  fontSize: number;
  width: number;
  height: number;
  fontWeight: string;
  fontName: string;
  fontStyle: string;
  textDecoration?: string;
  fill?: string;
}

const PdfViewer: React.FC = () => {
  const editSpanRef = useRef<HTMLSpanElement | null>(null);
  const viewportRef = useRef<Number>(1.5);
  const viewportHeightRef = useRef<Number>(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [editingText, setEditingText] = useState<TextItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const getSafeFont = (pdfFontName: string) => {
    if (!pdfFontName) return "sans-serif";
    const name = pdfFontName.toLowerCase();
    if (name.includes("serif") && !name.includes("sans")) return "serif";
    if (name.includes("mono") || name.includes("courier")) return "monospace";
    return "sans-serif";
  };

  const renderPdf = async () => {
    if (!fileUrl || !canvasRef.current) return;
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    viewportHeightRef.current = viewport.height;

    viewportRef.current = viewport.scale;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    setDimensions({ width: viewport.width, height: viewport.height });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const textContent = await page.getTextContent();
    const styles = textContent.styles;

    const items: TextItem[] = textContent.items.map((item: any) => {
      const [x, y] = viewport.convertToViewportPoint(
        item.transform[4],
        item.transform[5],
      );
      const fontStyle = styles[item.fontName];
      const fontSize = item.transform[0];
      const scaledFontSize = fontSize * viewport.scale;
      const calculatedHeight = item.height * viewport.scale;
      const fontName = item.fontName.toLowerCase();
      // console.log(item);
      const isBold =
        fontName.includes("bold") ||
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
        fontWeight: isBold ? "bold" : "normal",
        fontName: item.fontName,
        fontStyle:"normal",
        textDecoration:"none",
        fill:"black"
      };
    });
    setTextItems(items);
  };

  // --- NEW: PHASE 4 BACKEND INTEGRATION ---
  const savePdf = async () => {
    const editedItems = textItems.filter(
      (item) => item.text !== item.originalText,
    );

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
      const edits: SaveEdit[] = editedItems.map((item: any) => ({
        page: 1, // Currently supporting page 1
        x: item.x / Number(viewportRef.current),
        // Backend Y calculation: PageHeight - Frontend_Y - ElementHeight
        y:
          (Number(viewportHeightRef.current) - (item.y + item.height)) /
          Number(viewportRef.current),
        newText: item.text,
        fontFamily: item.fontFamily
          ? item.fontFamily
          : getSafeFont(item.fontFamily),
        fontSize: item.fontSize / Number(viewportRef.current),
        width: item.width / Number(viewportRef.current),
        height: item.height / Number(viewportRef.current),
        fontWeight: item.fontWeight,
        fontName: item.fontName,
        fontStyle: item.fontStyle,
        textDecoration: item.textDecoration,
        fill: item.fill,
      }));
      console.log("Edits to save:", edits);
      // 1. Use FormData instead of a JSON body
      const formData = new FormData();
      formData.append("pdf", originalFile); // The File object from your state
      formData.append("edits", JSON.stringify(edits)); // The edit data as a string

      const response = await fetch("http://localhost:5000/api/save-pdf", {
        method: "POST",

        body: formData,
      });

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const newtab = window.open(downloadUrl, "_blank");
      if (!newtab) {
        const link = document.createElement("a");
        link.href = downloadUrl;
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

  const handleBlur = (newValue: string | null, width: number) => {
    if (!editingText || newValue === null) return;

    setTextItems((prevItems) => {
      // 1. Find the item being edited
      const itemToUpdate = prevItems.find((item) => item.id === editingText.id);

      if (!itemToUpdate) return prevItems;

      // 2. Create the updated version of that item
      const updatedItem = {
        ...itemToUpdate,
        text: newValue,
        width: width,
      };

      // 3. Filter out the old version from the list
      const remainingItems = prevItems.filter(
        (item) => item.id !== editingText.id,
      );

      // 4. Return the list with the updated item at the VERY END (renders on top)
      return [...remainingItems, updatedItem];
    });

    setEditingText(null);
  };

  // const handleMouseEnter =(e:<MouseEvent>) => {
  //     const container = e.target.getStage()?.container();
  //     if(container)
  //     container.style.cursor = "text";
  //     };

  // const handleMouseLeave =(e:KonvaEventObject<MouseEvent>) => {
  //     const container = e.target.getStage()?.container();
  //     if(container)
  //     container.style.cursor = "default";
  //     };

  const updateSelectedText = (updates: Partial<TextItem>) => {
    if (!editingText) return;

    const updated = { ...editingText, ...updates };
    console.log(updated);
    // 1. Update the "active" editing state so the span changes immediately
    setEditingText(updated);

    // 2. Update the main list so the background SVG/Canvas stays in sync
    setTextItems((prev) =>
      prev.map((item) => (item.id === editingText.id ? updated : item)),
    );
  };

  return (
<div className="p-4 md:p-10 md:pb-0 mt-14 font-sans text-gray-800 w-full max-w-[1200px] mx-auto">
  <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">PDF Editor</h2>
  
  {/* Toolbar/Actions Area: Flex-col on mobile, flex-row on desktop */}
  <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800/50 p-4 rounded-lg">
    <input
      type="file"
      className="block w-full md:w-auto text-sm text-gray-300 
             file:mr-4 file:py-2 file:px-4 
             file:rounded-md file:border-0 
             file:text-sm file:font-semibold 
             file:bg-blue-50 file:text-blue-700 
             hover:file:bg-blue-100 cursor-pointer"
      onChange={uploadFile}
      accept="application/pdf"
    />
    <div className="flex gap-2 w-full md:w-auto">
      <button
        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm
               hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
        onClick={renderPdf}
        disabled={!fileUrl}
      >
        Render
      </button>
      <button
        onClick={savePdf}
        disabled={isSaving || textItems.length === 0}
        className="flex-1 md:flex-none px-4 py-2 bg-green-500 text-white rounded-md font-medium text-sm
               hover:bg-green-600 disabled:bg-gray-600 transition-colors"
      >
        {isSaving ? "..." : "Export PDF"}
      </button>
    </div>
  </div>

    {fileUrl && (
      /* STICKY TOOLBAR: Stays at the top of the scrollable area */
      <div className="sticky top-0 left-0 w-full flex justify-center z-[10003] pb-20 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-xl rounded-full border p-1 scale-90 md:scale-100 transition-transform">
          <Toolbar
            selectedElement={editingText}
            onUpdate={updateSelectedText}
          />
        </div>
      </div>
    )}
  {/* MAIN VIEWPORT: Scrollable container for the PDF */}
  <div className="relative border-4 border-slate-700 rounded-lg shadow-2xl bg-slate-400 overflow-auto max-h-[70vh]  custom-scrollbar">
    

    <div className="relative mx-auto" style={{ width: dimensions.width, height: dimensions.height }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 z-[1000] pointer-events-none"
      >
        {textItems.map((item) => {
          const isEdited = item.text.trim() !== item.originalText.trim();
          return (
            <g key={item.id} style={{ pointerEvents: "auto", cursor: "text" }}>
              {isEdited && (
                <rect
                  x={item.x}
                  y={item.y + 2}
                  width={item.width}
                  height={item.fontSize + 1.75}
                  fill="white"
                />
              )}
              {isEdited && (
                <text
                  x={item.x}
                  y={item.y + item.height}
                  fontSize={item.fontSize}
                  fontFamily={item.fontFamily}
                  fontWeight={item.fontWeight}
                  fontStyle={item.fontStyle}
                  textDecoration={item.textDecoration}
                  fill={item.fill || "black"}
                >
                  {item.text}
                </text>
              )}
              <rect
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                fill="transparent"
                onClick={() => setEditingText(item)}
                style={{ cursor: "text", pointerEvents: "all" }}
              />
            </g>
          );
        })}
      </svg>

      {editingText && (
        <span
          ref={editSpanRef}
          contentEditable
          suppressContentEditableWarning
          className="outline-none z-[10002] whitespace-nowrap bg-white p-0"
          style={{
            position: "absolute",
            top: editingText.y,
            left: editingText.x,
            minWidth: `${editingText.width}px`,
            height: `${editingText.height + 2}px`,
            fontSize: `${editingText.fontSize}px`,
            fontFamily: editingText.fontFamily,
            fontWeight: editingText.fontWeight,
            fontStyle: editingText.fontStyle,
            textDecoration: editingText.textDecoration,
            color: editingText.fill || "black",
          }}
          onBlur={(e) =>
            handleBlur(e.currentTarget.textContent, e.currentTarget.offsetWidth)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {editingText.text}
        </span>
      )}
    </div>
  </div>
</div>
  );
};

export default PdfViewer;
