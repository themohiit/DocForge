import { Button } from "@/components/ui/button"
import { NavigationMenu, } from "@/components/ui/navigation-menu" // For complex menus
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // For Mobile
import { Menu } from "lucide-react" // Icons
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
  
    <div className="w-full sticky  flex justify-center pt-2">
    <nav className="top-0 z-50 w-[60vw] border-b bg-black backdrop-blur  rounded-4xl text-white">
      <div className="container flex h-12 items-center justify-between p-2">
        
        {/* 1. LOGO SECTION */}
        <div className="flex items-center gap-2">
           <span className="font-bold text-xl">DocForge</span>
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
           <Button variant="ghost" className="hidden md:flex">Sign In</Button>
           <Button className=" bg-white text-black hover:bg-gray-300">Get Started</Button>
           
           {/* Mobile Trigger (Sheet) */}
           <div className="md:hidden">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" size="icon"><Menu /></Button>
               </SheetTrigger>
               <SheetContent side="right">
                 {/* Mobile Links go here */}
               </SheetContent>
             </Sheet>
           </div>
        </div>

      </div>
    </nav>
    </div>
  )
}