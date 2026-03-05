import { motion } from 'framer-motion'
import Card from './card'
import type { Variants } from 'framer-motion'
import { Typewriter } from './components/ui/typewriter'

// We keep the variants, but we'll apply them individually
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
}

function Home() {
  const words = ["Edit PDF", "Compress PDF", "Merge PDF", "PDF to Word"];
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-20 pb-20 bg-black text-white selection:bg-purple-500/30">
      
      {/* --- Hero Section --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center mb-28 px-6"
      >
        <span className="px-4 py-1.5 mb-6 text-sm font-medium tracking-wide text-yellow-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          The Modern PDF Standard
        </span>
        
        <h1 className="max-w-4xl text-4xl md:text-7xl font-bold tracking-tight mb-6 h-[120px] md:h-[160px]">
          The easiest way to <br /> 
          <Typewriter texts={words} />
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed mt-4">
          Professional tools, zero friction. Handle your documents directly 
          in your browser with military-grade speed.
        </p>
      </motion.div>

      {/* --- Individualized Scroll Grid --- */}
      <div className='w-[90vw] lg:w-[85vw] grid grid-cols-1 md:grid-cols-2 gap-8'>
        
        {/* Card 1 */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} // Triggers 50px before it hits the center for better flow
        >
          <Card feature='Edit PDF' description='Edit text directly in your PDFs with ease. Change colors, fonts, and family with just a few clicks.' link='/editpdf'/>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Card feature='Compress PDF' description='Reduce file size without compromising quality for easier sharing.' link='/compresspdf' button='Try now' />
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Card feature='Merge PDF' description='Combine multiple PDFs into one seamless, professional document.' link='/mergepdf'  button='Try now'/>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Card feature='PDF to Word' description='Convert PDFs to editable Word documents with perfect formatting.' link='/pdftoword' button='Try now'/>
        </motion.div>

      </div>
    </div>
  )
}

export default Home