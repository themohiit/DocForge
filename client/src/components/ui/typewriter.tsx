import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export function Typewriter({ texts }: { texts: string[] }) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const baseText = texts[textIndex];
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < baseText.length) {
        setDisplayText(baseText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
        // Wait 2 seconds then move to next text
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, 2000);
      }
    }, 100); // Speed of typing

    return () => clearInterval(typingEffect);
  }, [textIndex, texts]);

  return (
    <span className="relative">
      <span className="text-yellow-500 h-[40px] md:h-[60px]">{displayText}</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[2px] h-[40px] md:h-[60px] bg-yellow-500 ml-1 translate-y-2"
      />
    </span>
  );
}