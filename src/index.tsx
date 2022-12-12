import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

Sentry.init({
  dsn: "https://cd5f455951d44e21b22986bbf8ec5f38@o4504315322499072.ingest.sentry.io/4504315335278592",
  integrations: [new BrowserTracing()],

  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
