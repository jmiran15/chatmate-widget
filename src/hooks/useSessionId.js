import { useEffect, useState } from "react";
import { v4 } from "uuid";

export default function useSessionId(embedId) {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    function getOrAssignSessionId() {
      if (!window || !embedId) return;

      const STORAGE_IDENTIFIER = `chatmate_${embedId}_session_id`;
      const currentId = window.localStorage.getItem(STORAGE_IDENTIFIER);
      if (!!currentId) {
        console.log(`Resuming session id`, currentId);
        setSessionId(currentId);
        return;
      }

      const newId = v4();
      console.log(`Registering new session id`, newId);
      window.localStorage.setItem(STORAGE_IDENTIFIER, newId);
      setSessionId(newId);

      // should create a new chat when we create a new session id, so that we get the intro messages
    }
    getOrAssignSessionId();
  }, [window]);

  return sessionId;
}
