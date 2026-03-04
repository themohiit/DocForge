import { Button } from "@/components/ui/button"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // For Mobile

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from "react-router-dom"
import { Menu, FileEdit, FileArchive, Merge, FileType, Home } from "lucide-react";
const MobileNavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <Link 
    to={to} 
    className="flex items-center gap-4 px-3 py-4 rounded-xl transition-all duration-200 hover:bg-white/10 hover:translate-x-1 group"
  >
    <span className="text-yellow-500 group-hover:scale-110 transition-transform">
      {icon}
    </span>
    <span className="text-base font-medium text-gray-200 group-hover:text-white">
      {label}
    </span>
  </Link>
);

export default function Navbar() {
  return (
  
    <div className="w-full fixed  flex justify-center p-2">
    <nav className="top-0 z-5000 w-[90vw] lg:w-[80vw]  font-serif bg-white/10 backdrop-blur-sm border border-white/20  rounded-4xl text-white p-0.5">
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
            <Link 
                      to="/mergepdf" 
                      className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
                    >Merge PDF</Link>
            <Link 
                      to="/pdftoword" 
                      className="text-sm font-medium transition-colors hover:scale-105 hover:text-grey "
                    >PDF to Word</Link>
        </div>

        {/* 3. ACTIONS & MOBILE TOGGLE */}
        <div className="flex items-center gap-2">
          <SignedOut>
              <Button size='sm' variant="ghost" className=" text-white hover:bg-yellow-700"><SignInButton mode="redirect" /></Button>
              
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
           <Button size='sm' variant="ghost" className="lg:bg-yellow-600  text-white ">Get Started</Button>
           
           {/* Mobile Trigger (Sheet) */}
           <div className="md:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg shadow-yellow-900/20" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </SheetTrigger>
    
    <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-l border-white/10 text-white p-0 flex flex-col">
      {/* Header/Logo section inside Sidebar */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-700 bg-clip-text text-transparent">
          DocForge
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        <MobileNavLink to="/" icon={<Home size={20} />} label="Home" />
        
        <div className="my-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold px-3">Tools</div>
        
        <MobileNavLink to="/editpdf" icon={<FileEdit size={20} />} label="Edit PDF" />
        <MobileNavLink to="/compresspdf" icon={<FileArchive size={20} />} label="Compress PDF" />
        <MobileNavLink to="/mergepdf" icon={<Merge size={20} />} label="Merge PDF" />
        <MobileNavLink to="/pdftoword" icon={<FileType size={20} />} label="PDF to Word" />
      </nav>

      {/* Footer section (Clerk Integration) */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <SignedIn>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium text-gray-300">My Account</span>
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full bg-yellow-600 py-2 rounded-md font-bold text-black hover:bg-yellow-500 transition-all">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </SheetContent>
  </Sheet>
</div>
        </div>

      </div>
    </nav>
    </div>
  )
}