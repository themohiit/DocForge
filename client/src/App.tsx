import { Route, BrowserRouter as Router,Routes } from 'react-router-dom'
import PdfViewer from './PdfViewer'
import Navbar from './navbar'

function App() {
 

  return (
    <Router>        
        <Navbar/>
        <main className="min-h-screen  pt-16 flex flex-col items-center justify-start">
        <Routes>
          <Route path="/editpdf" element={<PdfViewer />} />
          <Route path="/compresspdf" element={<div>Compress PDF Page</div>} />
        </Routes>

        </main>
    </Router>
  )
}

export default App
