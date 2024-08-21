import { formatDuration, intervalToDuration } from "date-fns";

export const ElapsedTimeDisplay = ({ activeTime }: { activeTime: number }) => {
  const duration = intervalToDuration({ start: 0, end: activeTime });
  const formattedDuration = formatDuration(duration, {
    format: ["hours", "minutes", "seconds"],
    zero: true,
    delimiter: ":",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        color: "red",
        fontSize: "24px",
        fontWeight: "bold",
        textShadow: "1px 1px 2px black",
      }}
    >
      {formattedDuration}
    </div>
  );
};
