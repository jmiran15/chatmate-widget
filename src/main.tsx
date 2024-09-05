import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class MyWidgetElement extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    const appElement = document.createElement("div");
    appElement.id = "chatmate-widget-div";
    shadow.appendChild(appElement);
    const { embedId } = this.getScriptSettings();
    const root = ReactDOM.createRoot(appElement);

    root.render(
      <React.StrictMode>
        {embedId ? <App embedId={embedId} shadowRoot={shadow} /> : null}
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
