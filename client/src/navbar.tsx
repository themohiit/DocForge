import { Button } from "@/components/ui/button"
import { NavigationMenu, } from "@/components/ui/navigation-menu" // For complex menus
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // For Mobile
import { Menu } from "lucide-react" // Icons
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
  
    <div className="w-full fixed  flex justify-center p-2">
    <nav className="top-0 z-5000 w-[90vw] lg:w-[60vw] bg-gray-900 backdrop-blur  rounded-4xl text-white p-0.5">
      <div className="container flex h-12 items-center justify-between p-2">
        
        {/* 1. LOGO SECTION */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-yellow-600 font-bold text-xl">DocForge</Link>
        </div>

        {/* 2. DESKTOP NAV (Hidden on Mobile) */}
        <div className="hidden md:flex gap-6 items-center">
           {/* Use shadcn NavigationMenu here for dropdowns */}
           <Link 
                to="/editpdf" 
                className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
              >Edit PDF</Link>
           
           <Link 
                to="/compresspdf" 
                className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
              >Compress PDF</Link>
        </div>

        {/* 3. ACTIONS & MOBILE TOGGLE */}
        <div className="flex items-center gap-2">
           <Button size='sm'  variant="ghost" className="hidden md:flex">Sign In</Button>
           <Button size='sm' className=" hover:bg-white text-black bg-yellow-600">Get Started</Button>
           
           {/* Mobile Trigger (Sheet) */}
           <div className="md:hidden">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" size="icon"><Menu color="black"/></Button>
               </SheetTrigger>
               <SheetContent side="right" className="bg-black text-white">
                 {/* Mobile Links go here */}
                  <Link 
                to="/editpdf" 
                className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
              >Edit PDF</Link>
           
                <Link 
                      to="/compresspdf" 
                      className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
                    >Compress PDF</Link>
               </SheetContent>
             </Sheet>
           </div>
        </div>

      </div>
    </nav>
    </div>
  )
}