import {PDFDocument} from 'pdf-lib';
import React, { useState } from 'react'

function MergePDF() {
  const [inputFiles, setInputFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length < 2) {
        alert("Please select at least two PDF files.");
        return;
      }
      if (filesArray.length > 1) {
        setInputFiles(filesArray);
      }
    }
  };

  const handleMerge = async () => {
    if (inputFiles.length < 2) return; // Need at least 2 files to merge

    const mergedPdf = await PDFDocument.create();

    for (const file of inputFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save() ;
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    const newTab = window.open(downloadUrl, '_blank');
    if (!newTab) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `merged.pdf`;
      link.click();
    }
  };

  return (
    <div>
      <div className="container mx-auto p-4 mt-14 w-[90vw] lg:w-[60vw] flex lg:flex-row flex-col gap-4 ">
        <h1 className="text-2xl font-bold text-white">Merge PDF</h1>
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleInputChange}
          className="block text-sm text-gray-600 
                 file:mr-4 file:py-2 file:px-4 
                 file:rounded-md file:border-0 
                 file:text-sm file:font-semibold 
                 file:bg-blue-50 file:text-blue-700 
                 hover:file:bg-blue-100 cursor-pointer"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 lg:w-20  text-sm rounded"
          onClick={handleMerge}
        >
          Merge
        </button>
      </div>
    </div>
  );
}

export default MergePDF 