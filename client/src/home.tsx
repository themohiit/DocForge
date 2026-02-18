
import { motion } from 'framer-motion'
import Card from './card'
import type { Variants } from 'framer-motion'

// 1. Define the orchestration (The Container)
const containerVariants:Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each card starts 0.1s after the previous one
      delayChildren: 0.3,    // Wait 0.3s before starting the sequence
    },
  },
}

// 2. Define the movement (The Items)
const cardVariants:Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
}

function Home() {
  return (
    <div className="flex justify-center w-full min-h-screen pt-13">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className='text-white text-3xl font-bold bg-[#0c0d13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] w-[90vw] lg:w-[60vw] h-full rounded-4xl p-8 grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-8 border border-white/10'
      >
        {/* Wrap each Card in a motion.div to apply the variant */}
        <motion.div variants={cardVariants}>
          <Card feature='Edit PDF' description='Lorem ipsum dolor sit amet...' link='/editpdf'/>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card feature='Compress PDF' description='Lorem ipsum dolor sit amet...' link='/compresspdf' button='Coming soon...' />
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card feature='Merge PDF' description='Lorem ipsum dolor sit amet...' link='/mergepdf'  button='Coming soon...'/>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card feature='PDF to Word' description='Lorem ipsum dolor sit amet...' link='/pdftoword' button='Coming soon...'/>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home