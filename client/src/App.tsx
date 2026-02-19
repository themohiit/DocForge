import { Route, BrowserRouter as Router,Routes } from 'react-router-dom'
import Navbar from './navbar'
import Home from './home'
import PdfViewer from './features/PdfViewer'
import CompressPDF from './features/compresspdf'

function App() {
 

  return (
    <Router>
        <div className='bg-black'>
        <Navbar/>
        <main className="min-h-screen  pt-5 flex flex-col items-center justify-start">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editpdf" element={<PdfViewer />} />
          <Route path="/compresspdf" element={<CompressPDF />} />
        </Routes>

        </main>
          </div>        
    </Router>
  )
}

export default App
