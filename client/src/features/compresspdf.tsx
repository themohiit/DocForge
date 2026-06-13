
import React, { useState } from 'react'
import { Spinner } from "@/components/ui/spinner"
function CompressPDF() {
  const [inputFile, setinputFile]= useState<File |null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [powerLevel, setPowerLevel] = useState(2);

  const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files && e.target.files.length > 0 && e.target.files.length <= 1 && e.target.files[0].type === 'application/pdf'){
      setinputFile(e.target.files[0])
    }
    else if(e.target.files && e.target.files[0].type !== 'application/pdf'){
      alert("Please select a PDF file.")
      e.target.value = ''; 
    }
  }

  const handleCompress = async () => {
    if (!inputFile) {
        alert("Please select a PDF file first.");
        return;
    }
    setIsLoading(true); // 1. Start Spinner
    try {
        const formData = new FormData();
        // NOTE: Make sure the key 'pdf' matches what your Express server expects!
        formData.append('pdf', inputFile);
        formData.append('powerLevel', powerLevel.toString());

        const baseUrl = import.meta.env.VITE_API_URL || 'https://docforge-2.onrender.com';
        const response = await fetch(`${baseUrl}/api/compressPdf`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Compression failed on server");

        // 1. Get the response as a Blob
        const blob = await response.blob();

        // 2. Create a temporary URL for the blob
        const downloadUrl = window.URL.createObjectURL(blob);

        // 3. Create a hidden <a> tag to trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // 4. Set the file name (FIXED: should be .pdf not .docx)
        const fileName = inputFile.name.replace('.pdf', '_compressed.pdf');
        link.setAttribute('download', fileName);

        // 5. Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        // 6. Clean up the URL object to save memory
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("Error compressing PDF:", error);
        alert("An error occurred while compressing the file.");
    }
    finally {
      setIsLoading(false); // 3. Stop Spinner (works for success AND error)
    }
}
  return (
    <div>
          <div className="container mx-auto p-4 mt-14 w-[90vw] lg:w-[60vw] ">
            <h1 className="text-2xl font-bold text-white mb-2">Compress PDF</h1>
            <div className=' flex lg:flex-row flex-col gap-4 items-center'>
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
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Level:</label>
              <select 
                value={powerLevel} 
                onChange={(e) => setPowerLevel(parseInt(e.target.value))}
                className="bg-gray-800 text-white rounded p-2 text-sm border border-gray-600"
              >
                <option value={1}>1 (Smallest File)</option>
                <option value={2}>2 (Balanced)</option>
                <option value={3}>3 (High Quality)</option>
                <option value={4}>4 (Prepress)</option>
              </select>
            </div>
            <button className="bg-yellow-600  hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded " onClick={handleCompress}>{isLoading ? <Spinner className="h-4 w-4" /> : "Compress PDF"}</button>
            </div>
          </div>
        </div>
  )
}

export default CompressPDF
