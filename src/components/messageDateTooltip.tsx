import { format } from "date-fns";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const MessageDateTooltip: React.FC<{
  date: string | Date;
  parentRef: React.RefObject<HTMLElement>;
}> = ({ date, parentRef }) => {
  const [position, setPosition] = useState<"left" | "right">("left");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const formattedDate = format(new Date(date), "MMM d, yyyy 'at' h:mm a");

  useEffect(() => {
    const updatePosition = () => {
      if (tooltipRef.current && parentRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (tooltipRect.right > parentRect.right) {
          setPosition("right");
        } else {
          setPosition("left");
        }
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [parentRef]);

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`absolute bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 ${
        position === "right" ? "right-0" : "left-0"
      }`}
    >
      {formattedDate}
    </motion.div>
  );
};

export default React.memo(MessageDateTooltip);
