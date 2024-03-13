// class ChatmateWidget extends HTMLElement {
//   async connectedCallback() {
//     const shadowRoot = this.attachShadow({ mode: "open" });

//     const script = document.createElement("script");
//     script.src = "https://chatmate-widget.vercel.app/main.min.js";
//     script.setAttribute(
//       "data-embed-id",
//       "e95f87ab-d525-4a8e-b9ca-4fe17e5c3d23"
//     );
//     shadowRoot.appendChild(script);
//   }
// }

// customElements.define("chatmate-we", ChatmateWidget);

// const appContainer = document.createElement("chatmate-we");
// document.body.appendChild(appContainer);
