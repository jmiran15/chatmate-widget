import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Custom element for the widget
class MyWidgetElement extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to the element.
    const shadowRoot = this.attachShadow({ mode: "open" });

    // Create a div to host the React app
    const appElement = document.createElement("div");

    appElement.id = "chatmate-widget-div";

    shadowRoot.appendChild(appElement);

    const { embedId } = this.getScriptSettings();

    const root = ReactDOM.createRoot(appElement);
    root.render(
      <React.StrictMode>
        <App embedId={embedId} />
      </React.StrictMode>
    );
  }

  getScriptSettings() {
    const currentScript = document.querySelector(
      "script[data-chatmate-widget-script]"
    );
    return Object.assign({}, currentScript?.dataset || {});
  }
}

customElements.define("my-widget", MyWidgetElement);

document.body.appendChild(new MyWidgetElement());
