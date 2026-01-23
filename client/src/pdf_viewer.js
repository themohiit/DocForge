import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PdfViewer = () => {
  const [fileUrl, setFileUrl] = useState(null);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch("http://localhost:4000/uploads", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFileUrl(`http://localhost:4000/pdf/${data.filename}`);
  };
  
  const renderPdf = async () => {
  const loadingTask = pdfjsLib.getDocument(fileUrl);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.getElementById("pdf-canvas");
  const context = canvas.getContext("2d");
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // 1. Render the PDF page first
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // 2. Get text content
  const textContent = await page.getTextContent();
  
  context.strokeStyle = "red";
  context.lineWidth = 1;

  textContent.items.forEach((item) => {
    // item.transform contains [scaleX, skewX, skewY, scaleY, tx, ty]
    const tx = item.transform[4];
    const ty = item.transform[5];

    // Convert PDF coordinates (bottom-left) to Canvas coordinates (top-left)
    // We use the item's height to find the top of the text
    const [x, y] = viewport.convertToViewportPoint(tx, ty);
    
    // Scale the width and height according to the viewport
    const width = item.width * viewport.scale;
    const height = item.height * viewport.scale;

    // Draw the rectangle 
    // Note: y in viewport is the baseline, so we subtract height to draw from top
    context.strokeRect(x, y - height, width, height);
  });
};

  return (
    <div>
      <input type="file" onChange={uploadFile} accept="application/pdf" />
      <button onClick={renderPdf}>Submit</button>
      <canvas id="pdf-canvas"></canvas>
    </div>
  );
};

export default PdfViewer;
