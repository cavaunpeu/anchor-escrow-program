import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
require("@solana/wallet-adapter-react-ui/styles.css");
require("./index.css");

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
