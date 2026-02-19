
import React, { useState } from 'react'

function CompressPDF() {
  const [inputFile, setinputFile]= useState<File |null>(null)


  const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files && e.target.files.length > 0 && e.target.files.length <= 1){
      setinputFile(e.target.files[0])
    }
  }

  const handleCompress = async()=>{
    if(!inputFile) return;
    const formData = new FormData;
    formData.append('pdf',inputFile)

    const response = await fetch('http://localhost:5000/api/compress-pdf',{
      method:"POST",
      body:formData
    });
    const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const newtab = window.open(downloadUrl, '_blank');
      if(!newtab){
        const link = document.createElement('a');
        link.href =downloadUrl;
        link.download = `edited_${inputFile.name}.pdf`;
        link.click();

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
