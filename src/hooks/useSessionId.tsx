import { useEffect, useState } from "react";
import { v4 } from "uuid";

export default function useSessionId(embedId: string) {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    function getOrAssignSessionId() {
      if (!window || !embedId) return;

      const STORAGE_IDENTIFIER = `chatmate_${embedId}_session_id`;
      const currentId = window.localStorage.getItem(STORAGE_IDENTIFIER);
      if (!!currentId) {
        setSessionId(currentId);
        return;
      }

      const newId = v4();
      window.localStorage.setItem(STORAGE_IDENTIFIER, newId);
      setSessionId(newId);
    }
    getOrAssignSessionId();
  }, [window]);

  return sessionId;
}
