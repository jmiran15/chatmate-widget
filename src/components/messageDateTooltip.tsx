import { motion } from "framer-motion";
import { format } from "date-fns";

const MessageDateTooltip = ({ date }) => {
  console.log("date", date);

  const formattedDate = format(new Date(date), "MMM d, yyyy 'at' h:mm a");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap"
    >
      {formattedDate}
    </motion.div>
  );
};

export default MessageDateTooltip;
