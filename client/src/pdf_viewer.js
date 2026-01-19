import React, { useState } from 'react'
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PdfViewer = () => {
  const [fileUrl,setFileUrl]=useState(null);
  
  const uploadFile = async (e) =>{
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("pdf",file);

    const res = await fetch("http://localhost:4000/upload",{
      method:"POST",
      body:formData
    });
    const data = await res.json();
    setFileUrl(`http://localhost:4000/upload/pdf/${data.filename}`)
    
  }
  const renderPdf = async () => {
  // 1. Check if fileUrl exists before doing anything
  if (!fileUrl) {
    alert("Please upload a file and wait for it to finish before rendering!");
    return;
  }

  try {
    // 2. Clear previous canvas content (optional but good practice)
    const canvas = document.getElementById("pdf-canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    
    // ... rest of your code
  } catch (err) {
    console.error("Error rendering PDF:", err);
  }
}

  return (
    <div>
      <input type="file" onChange={uploadFile} accept='application/pdf'/>
      <button onClick={renderPdf}>Submit</button>
      <canvas id='pdf-canvas'></canvas>
    </div>
  )
}

export default PdfViewer
