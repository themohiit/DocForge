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
    const file = await pdfjsLib.getDocument(fileUrl).promise;
    const page = await file.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = await document.getElementById("pdf-canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    const textContent = await page.getTextContent();
    console.log(textContent);
    const convertY = (pdfY) => viewport.height - pdfY;
    const textItem = textContent.items.map(item=>{
      const [a,b,c,d,x,y] = item.transform;
      return{
        text:item.str,
        x,
        y:viewport.height-y,
        fontSize:item.height,
      };
    });
    textItem.forEach(item=>{
      context.strikeStyle="red";
      context.strokeRect(item.x,item.y-item.fontSize,item.text.length*8,item.fontSize);
    })
    console.log(textItem);
    

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
