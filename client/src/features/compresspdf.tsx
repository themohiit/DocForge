
import React, { useState } from 'react'
import { Spinner } from "@/components/ui/spinner"
function CompressPDF() {
  const [inputFile, setinputFile]= useState<File |null>(null)
  const [isLoading, setIsLoading] = useState(false);

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

        const response = await fetch('https://docforge-2.onrender.com/api/compressPdf', {
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
        
        // 4. Set the file name
        const fileName = inputFile.name.replace('.pdf', '.docx');
        link.setAttribute('download', fileName);

        // 5. Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        // 6. Clean up the URL object to save memory
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error("Error converting PDF to Word:", error);
        alert("An error occurred while converting the file.");
    }
    finally {
      setIsLoading(false); // 3. Stop Spinner (works for success AND error)
    }
}
  return (
    <div>
          <div className="container mx-auto p-4 mt-14 w-[90vw] lg:w-[60vw] ">
            <h1 className="text-2xl font-bold text-white mb-2">Compress PDF</h1>
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
            <button className="bg-yellow-600  hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded " onClick={handleCompress}>{isLoading ? <Spinner className="h-4 w-4" /> : "Compress PDF"}</button>
            </div>
          </div>
        </div>
  )
}

export default CompressPDF
