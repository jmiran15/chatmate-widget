import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class MyWidgetElement extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
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
    ) as HTMLScriptElement;
    return Object.assign({}, currentScript?.dataset || {});
  }
}

customElements.define("my-widget", MyWidgetElement);

document.body.appendChild(new MyWidgetElement());
