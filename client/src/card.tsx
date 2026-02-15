
import { Button } from '@/components/ui/button'

import { Link } from 'react-router-dom'

interface CardProps {
  feature: string,
  description: string,
  link: string,
  button?: string
}
function Card(props:CardProps) { // Pro Tip: React components should always be Capitalized
  return (
    // Added 'flex flex-col' to manage internal vertical spacing
    <div className='min-w-[26vw] md:min-h-[20vw] min-h-[15vw]  bg-zinc-900 text-white flex flex-col rounded-xl border border-zinc-800 shadow-2xl overflow-hidden'>
      
      <div className="heading">
        <h2 className='sm:text-2xl font-bold p-4 pb-2 text-sm'>{props.feature}</h2>
      </div>

      {/* Adding 'flex-grow' here pushes the button div to the bottom */}
      <div className="description grow">
        <p className='sm:text-sm p-4 text-gray-400 text-xs'>
          {props.description}
        </p>
      </div>

      {/* Container for the button at the bottom right */}
      <div className="button-container p-4 flex justify-end">
        <Button 
          variant="ghost"
          className='text-yellow-600  hover:text-white hover:bg-yellow-600 font-semibold transition-all'
        >
          <Link to={props.link} className='font-mono'>
          {props.button?props.button:"Try Now"}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Card