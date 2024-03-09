import { CHAT_UI_REOPEN } from "@/utils/constants";
import { useState } from "react";

export default function useOpenChat() {
  const [isOpen, setOpen] = useState(
    !!window?.localStorage?.getItem(CHAT_UI_REOPEN) || false
  );

  function toggleOpenChat(newValue) {
    console.log("toggleOpenChat", newValue);
    if (newValue === true) window.localStorage.setItem(CHAT_UI_REOPEN, "1");
    if (newValue === false) window.localStorage.removeItem(CHAT_UI_REOPEN);
    setOpen(newValue);
  }

  console.log("the open value: ", isOpen);

  return { isChatOpen: isOpen, toggleOpenChat };
}
