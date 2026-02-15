import { Route, BrowserRouter as Router,Routes } from 'react-router-dom'
import PdfViewer from './PdfViewer'
import Navbar from './navbar'
import Home from './home'

function App() {
 

  return (
    <Router>
        <div className='bg-black'>
        <Navbar/>
        <main className="min-h-screen  pt-14 flex flex-col items-center justify-start">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editpdf" element={<PdfViewer />} />
          <Route path="/compresspdf" element={<div>Compress PDF Page</div>} />
        </Routes>

        </main>
          </div>        
    </Router>
  )
}

export default App
