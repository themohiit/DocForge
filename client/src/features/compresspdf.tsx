
import React, { useState } from 'react'

function CompressPDF() {
  const [inputFile, setinputFile]= useState<File |null>(null)


  const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files && e.target.files.length > 0 && e.target.files.length <= 1){
      setinputFile(e.target.files[0])
    }
  }

  const handleCompress = async () => {
    if (!inputFile) {
        alert("Please select a PDF file first.");
        return;
    }

    try {
        const formData = new FormData();
        // NOTE: Make sure the key 'pdf' matches what your Express server expects!
        formData.append('pdf', inputFile);

        const response = await fetch('http://localhost:5000/api/compressPdf', {
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
}
  return (
    <div>
      <div>
        <div className="container mx-auto p-4 mt-14 w-[60vw] flex flex-col items-center justify-start gap-4">
            <h1 className="text-2xl font-bold text-white">Compress PDF</h1>
            <input type="file" accept='.pdf' onChange={handleInputChange} className="block text-sm text-gray-600 
                 file:mr-4 file:py-2 file:px-4 
                 file:rounded-md file:border-0 
                 file:text-sm file:font-semibold 
                 file:bg-blue-50 file:text-blue-700 
                 hover:file:bg-blue-100 cursor-pointer"/>
                 <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCompress}>Compress</button>
          </div>
      </div>
    </div>
  )
}

export default CompressPDF
