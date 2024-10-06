import ReactDOM from "react-dom/client";
import App from "./App";
// Import the styles as a string
import { Fragment } from "react/jsx-runtime";
import styles from "./index.css?inline";

const defaultRootId = "chatmate-widget-container";

const IS_SERVER = typeof window === "undefined";

// Add this type declaration at the top of the file
declare global {
  interface Window {
    chatMateWidgetInitialized?: boolean;
  }
}

function initializeWidget() {
  if (IS_SERVER) {
    return;
  }

  let rootElement = document.getElementById(defaultRootId);

  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = defaultRootId;
    document.body.appendChild(rootElement);
  }

  const { embedId } = getScriptSettings();

  const root = ReactDOM.createRoot(rootElement);
  if (root && embedId) {
    root.render(
      <Fragment>
        <style>{styles}</style>
        <div className="cm-root">
          <div className="cm-html">
            <div className="cm-body">
              <App embedId={embedId} />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

function getScriptSettings() {
  const currentScript = document.querySelector(
    "script[data-chatmate-widget-script]"
  ) as HTMLScriptElement;
  return Object.assign({}, currentScript?.dataset || {});
}

// Modify the initialization call
if (!IS_SERVER) {
  const initialize = () => {
    if (!window.chatMateWidgetInitialized) {
      initializeWidget();
      window.chatMateWidgetInitialized = true;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Fallback for any edge cases
  window.addEventListener("load", initialize);
}
