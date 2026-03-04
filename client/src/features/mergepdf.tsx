import { Spinner } from '@/components/ui/spinner';
import {PDFDocument} from 'pdf-lib';
import React, { useState } from 'react'

function MergePDF() {
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (filesArray.length > 1 && filesArray.every(file => file.type === 'application/pdf')) {
        setInputFiles(filesArray);
      }
      if (filesArray.length < 2) {
        alert("Please select at least two PDF files.");
        e.target.value = ''; 
        
        return;
      }
      else{
        alert("Please select only PDF files.");
        e.target.value = ''; 
      }
    }
  };

  const handleMerge = async () => {
    if (inputFiles.length < 2) return; // Need at least 2 files to merge

    try{const mergedPdf = await PDFDocument.create();
    setIsLoading(true); // Start Spinner
    for (const file of inputFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save() ;
    const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    const newTab = window.open(downloadUrl, '_blank');
    if (!newTab) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `merged.pdf`;
      link.click();
    }}
    catch(error){
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the files.");
    }
    finally{
      setIsLoading(false); // Stop Spinner
    } 
  };

  return (
    <div>
      <div className="container mx-auto p-4 mt-14 w-[90vw] lg:w-[60vw] ">
        <h1 className="text-2xl font-bold text-white mb-2">Merge PDF</h1>
        <div className=' flex lg:flex-row flex-col gap-4'>
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
        <button className="bg-yellow-600  hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded " onClick={handleMerge}>{isLoading ? <Spinner className="h-4 w-4" /> : "Merge PDFs"}</button>
        </div>
      </div>
    </div>
  );
}

export default MergePDF 