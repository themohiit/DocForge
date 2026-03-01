import  { CompactPicker } from "react-color";


import {
 BoldIcon,
    ChevronDownIcon,
  
    ItalicIcon,
   

    ListTodoIcon,
   
    MessageSquarePlusIcon,
    Printer,
    Redo2Icon,
    RemoveFormattingIcon,
   
    SpellCheckIcon, UnderlineIcon,
    Undo2Icon,
 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";




import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ToolbarButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    icon: LucideIcon
};


interface ToolbarProps {
  selectedElement: any | null; // The TextItem being edited
  onUpdate: (updates: Partial<any>) => void; // Function to push changes back
}

// const FontSizeButton=()=>{
    
//     const currentFontSize = "16px";
//     const [fontSize, setFontSize] = useState(currentFontSize);
//     const[inputValue,setInputValue] = useState(fontSize);
//     const [isEditing, setIsEditing] = useState(false);

//     const updateFontSize = (newSize:string)=>{
//         const size = parseInt(newSize);
//         if(!isNaN(size) && size>0){
            
//             setFontSize(newSize);
//             setInputValue(newSize);
//             setIsEditing(false);
//         }
//     }
//     const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
//         setInputValue(e.target.value);
//     }
//     const handleInputBlur = ()=>{
//         updateFontSize(inputValue);
//     }
//     const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>)=>{
//         if(e.key === "Enter"){e.preventDefault();
//         updateFontSize(inputValue);
//         }
//     }
//     const increment =()=>{
//         const newSize = parseInt(fontSize) +1;
//         updateFontSize(newSize.toString());
//     }
//     const decrement =()=>{
//         const newSize = parseInt(fontSize) -1;
//         if(newSize>0){updateFontSize(newSize.toString());}
//     }

//     return(
//         <div className="flex items-center gap-x-0.5">
//             <button 
//             onClick={decrement}
//             className="
//                 h-7 w-7 shrink-0 flex  items-center justify-center rounded-sm hover:bg-neutral-200/80">
//                 <MinusIcon  className="size-4"/>
//             </button>
//             {isEditing?(
//                 <input
//             className="
//                 h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent focus:outline focus:ring-0"
//                 type="text"
               
//                 onChange={handleInputChange}
//                 onBlur={handleInputBlur}
//                 onKeyDown={handleKeyDown} 
//                 value={inputValue}
//                 autoFocus
//                 />
//             ):(

//                 <button  
//                 onClick={()=>{
//                     setIsEditing(true);
//                     setFontSize(currentFontSize)
//                 }}
//                 className="
//                 h-7 w-10 text-sm border border-neutral-400 rounded-sm bg-transparent cursor-text ">{currentFontSize}
//                 </button>

//             )}
//             <button 
//             onClick={increment}
//             className="
//                 h-7 w-7 shrink-0 flex  items-center justify-center rounded-sm hover:bg-neutral-200/80">
//                 <PlusIcon  className="size-4"/>
//             </button>
//         </div>
//     )
// }

interface TextColorButtonProps {
  value?: string;
  onChange: (color: string) => void;
}


// const TextColorButton = (props: TextColorButtonProps) => {
//     // 1. Create local state to track the color during the drag
//     const [localColor, setLocalColor] = useState(props.value || "#000000");

//     // 2. Keep local state in sync if props change externally
//     useEffect(() => {
//         setLocalColor(props.value || "#000000");
//     }, [props.value]);

//     const handleOnChange = (color: ColorResult) => {
//         setLocalColor(color.hex); // Update UI immediately
//         props.onChange(color.hex); // Pass up to parent
//     };

//     return (
//         <HoverCard>
//             <HoverCardTrigger asChild>
//                 <button 
//                     onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                     }}
//                     className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
//                     <span className="text-xs">A</span>
//                     <div className="h-0.5 w-full" style={{ backgroundColor: localColor }} />
//                 </button>
//             </HoverCardTrigger>
//             <HoverCardContent className="p-0 border-none"  onMouseDown={(e) => e.stopPropagation()}>
//                 {/* 3. Stop propagation on the wrapper to prevent menu interference */}
//                 <div onMouseDown={(e) => e.stopPropagation()} onClick={(e)=>e.preventDefault()}>
//                     <SketchPicker 
//                         // onSwatchHover={(color, event) => {
//                         //         props.onChange(color.hex);
//                         //     }}
//                         color={localColor} 
//                         onChange={handleOnChange} 
//                     />
//                 </div>
//             </HoverCardContent>
//         </HoverCard>
//     );
// };

const TextColorButton = (props: TextColorButtonProps) => {
    const [open, setOpen] = useState(false);
    const value = props.value || "#000000";

    return (
        <div 
            onMouseEnter={() => setOpen(true)} 
            onMouseLeave={() => setOpen(false)}
            className="relative"
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button 
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5"
                    >
                        <span className="text-xs">A</span>
                        <div className="h-0.5 w-full" style={{ backgroundColor: value }} />
                    </button>
                </PopoverTrigger>

                <PopoverContent 
                    side="bottom" 
                    align="start" 
                    className="p-0 w-auto border-none shadow-md"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    {/* We wrap it in a div just to catch the mouse events 
                        and stop them from bubbling up to the editor 
                    */}
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <CompactPicker
                            color={value}
                            // 1. This handles the hover selection perfectly for CompactPicker
                            onSwatchHover={(color) => {
                                props.onChange(color.hex);
                            }}
                            // 2. This ensures it also works if they actually click a color
                            onChange={(color) => {
                                props.onChange(color.hex);
                            }}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};


const FontFamilyButton = ({ value, onChange }: { value: string, onChange: (font: string) => void }) => {
    const [open, setOpen] = useState(false);

    const fonts = [
        { label: "Arial", value: "Arial" },
        { label: "Times New", value: "Times New Roman" },
        { label: "Courier New", value: "Courier New" },
        { label: "Georgia", value: "Georgia" },
        { label: "Verdana", value: "Verdana" }
    ];

    // Find the current label or fallback to Arial
    const currentLabel = fonts.find(f => f.value === value)?.label || "Arial";

    return (
        <div 
            onMouseEnter={() => setOpen(true)} 
            onMouseLeave={() => setOpen(false)}
            className="relative"
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button 
                        type="button"
                        onMouseDown={(e) => e.preventDefault()} // Keeps editor focus
                        className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm"
                    >
                        <span className="truncate">{currentLabel}</span>
                        <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                    </button>
                </PopoverTrigger>

                <PopoverContent 
                    side="bottom" 
                    align="start" 
                    className="p-1 flex flex-col gap-y-1 w-[120px] max-h-20 overflow-auto"
                    onOpenAutoFocus={(e) => e.preventDefault()} // Prevents stealing focus from span
                >
                    {fonts.map((font) => (
                        <button
                            key={font.value}
                            type="button"
                            // 1. This handles the "Hover to Change" logic
                            onMouseEnter={() => onChange(font.value)}
                            // 2. This locks it in or handles clicks
                            onClick={() => {
                                onChange(font.value);
                                setOpen(false);
                            }}
                            onMouseDown={(e) => e.preventDefault()} // Keeps selection active
                            className={cn(
                                "flex items-center gap-x-2 px-2 py-1 rounded-sm text-left hover:bg-neutral-200/80",
                                value === font.value && "bg-neutral-200/80"
                            )}
                            style={{ fontFamily: font.value }}
                        >
                            <span className="text-sm">{font.label}</span>
                        </button>
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
};

// const FontFamilyButton = () => {
   
//     const fonts = [
//         { label: "Arial", value: "Arial" },
//         { label: "Times New Roman", value: "Times New Roman" },
//         { label: "Courier New", value: "Courier New" },
//         { label: "Georgia", value: "Georgia" },
//         { label: "verdana", value: "verdana" }

//     ];

//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <button className="
//                 h-7 w-[120px] shrink-0 flex items-ceter justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
//                     <span className="truncate">
//                         {"Arial"}
//                     </span>
//                     <ChevronDownIcon className="ml-2 size-4 shrink-0" />
//                 </button>

//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
//                 {fonts.map(({ label, value }) => (
//                     <button
//                         onClick={() => {
//                             return
//                         }}
//                         key={value}
//                         className={cn(
//                             "flex items-center gap-x-2 px-2 rounded-sm hover:bg-neutral-200/80",
//                            "bg-neutral-200/80"
//                         )}
//                         style={{ fontFamily: value }} >
//                         <span className="text-sm">{label}</span>
//                     </button>
//                 ))
//                 }
//             </DropdownMenuContent>

//         </DropdownMenu>
//     )
// }

const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon
}: ToolbarButtonProps) => {
    return (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn("text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80"
                , isActive && "bg-neutral-200/80"
            )}>
            <Icon className="size-4" />
        </button>
    )
}


const Toolbar = ({ selectedElement, onUpdate }: ToolbarProps) => {
    


    const sections: {
        label: string;
        icon: LucideIcon;
        onClick: () => void;
        isActive?: boolean;
    }[][] = [
            [
                {
                    label: "Undo",
                    icon: Undo2Icon,
                    onClick: () => {return;},
                },
                {
                    label: "Redo",
                    icon: Redo2Icon,
                    onClick: () => {return;},
                },
                {
                    label: "Print",
                    icon: Printer,
                    onClick: () => window.print(),
                },
                {
                    label: "Spell Check",
                    icon: SpellCheckIcon,
                   onClick: () => {return;}
                }


            ],
            [
                {
                    label: "Bold",
                    icon: BoldIcon,

                    onClick: () => {
                        console.log(selectedElement);
                        onUpdate({ fontWeight: selectedElement?.fontWeight === "bold" ? "normal" : "bold" })
                },
                    isActive: selectedElement?.fontWeight === "bold",
                },
                {
                    label: "Italic",
                    icon: ItalicIcon,
                    isActive: selectedElement?.fontStyle === "italic",
                   onClick: () => onUpdate({ fontStyle: selectedElement?.fontStyle === "italic" ? "normal" : "italic" }),
                },
                {
                    label: "Underline",
                    icon: UnderlineIcon,
                    isActive: selectedElement?.textDecoration === "underline",
                    onClick: () => onUpdate({ textDecoration: selectedElement?.textDecoration === "underline" ? "none" : "underline" }),
                }

            ],

            [
                {
                    label: "Comment",
                    icon: MessageSquarePlusIcon,
                    onClick: () => {return;},
                    isActive: false,
                },
                {
                    label: "List Todo",
                    icon: ListTodoIcon,
                    onClick: () => {return;},
                    isActive: false,
                },
                {
                    label: "Remove Formatting",
                    icon: RemoveFormattingIcon,
                    onClick: () => {return;},

                }
            ]
        ]


    return (
        <div className="bg-[#F1F4F9] px-2.5 py-0.5  min-h-5 flex items-center gap-x-0.5 w-max rounded-md">

            {/* {sections[0].map((item) => (
                <ToolbarButton key={item.label} {...item} />
            ))} */}
            {/* <Separator orientation="vertical" className="h-6 bg-neutral-900" /> */}
            <FontFamilyButton
                value={selectedElement?.fontFamily || "Arial"} 
                onChange={(fontFamily) => onUpdate({ fontFamily })} />
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {/* <HeadingLevelButton /> */}
            {/* <Separator orientation="vertical" className="h-6 bg-neutral-300" /> */}
            {/* <FontSizeButton/> */}
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {sections[1].map((item) => (
                <ToolbarButton key={item.label} {...item} />
            ))}
            <TextColorButton 
                // Use the current color from the selected text, fallback to black
                value={selectedElement?.fill || "#000000"} 
                onChange={(color) => onUpdate({ fill: color })}
            />
            
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
                       
            {/* {sections[2].map((item) => (
                <ToolbarButton key={item.label} {...item} />
            ))} */}
        </div>
    )
}

export default Toolbar;