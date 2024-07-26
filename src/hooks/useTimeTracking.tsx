// import { useState, useEffect, useRef, useCallback } from "react";

// const useActiveTimeTracker = (initialElapsedMs: string) => {
//   console.log("initialElapsedMs", Number(initialElapsedMs));
//   const [activeTime, setActiveTime] = useState(Number(initialElapsedMs));
//   const [isActive, setIsActive] = useState(false);
//   const startTimeRef = useRef<number | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const startTracking = useCallback(() => {
//     setIsActive(true);
//     startTimeRef.current = Date.now();
//   }, []);

//   const stopTracking = useCallback(() => {
//     if (isActive) {
//       setIsActive(false);
//       const endTime = Date.now();
//       const duration = endTime - (startTimeRef.current || endTime);
//       setActiveTime((prevTime) => prevTime + duration);
//       startTimeRef.current = null;
//     }
//   }, [isActive]);

//   const resetInactivityTimer = useCallback(() => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//     timeoutRef.current = setTimeout(stopTracking, 60000);
//   }, [stopTracking]);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, []);

//   return {
//     activeTime,
//     startTracking,
//     stopTracking,
//     resetInactivityTimer,
//   };
// };

// export default useActiveTimeTracker;
