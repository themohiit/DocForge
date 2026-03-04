import { Route, BrowserRouter as Router,Routes } from 'react-router-dom'
import Navbar from './navbar'
import Home from './home'
import PdfViewer from './features/PdfViewer'
import CompressPDF from './features/compresspdf'
import MergePDF from './features/mergepdf'
import PdfToDocx from './features/pdfToDocx'
import Footer from './components/ui/footer'
function App() {
 

  return (
    <Router>
        <div className='bg-black  bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] '>
        <Navbar/>
        <main className="min-h-screen  pt-5 flex flex-col items-center justify-start">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editpdf" element={<PdfViewer />} />
          <Route path="/compresspdf" element={<CompressPDF />} />
          <Route path="/mergepdf" element={<div className='text-white mt-14'><MergePDF /></div>} />
          <Route path="/pdftoword" element={<div className='text-white mt-14'><PdfToDocx /></div>} />
        </Routes>
        </main>
        <div className=' justify-center'>
        <Footer/>
          </div>
          </div>        
    </Router>
  )
}

export default App
