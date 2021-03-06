import { FC } from "react";
import { isMobile } from "react-device-detect";
import Navigation from "./Navigation";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import config from "./config.json";

// Get endpoint
const cluster = config["cluster"];
let endpoint: string;

if (cluster === "localhost") {
  endpoint = "http://127.0.0.1:8899";
} else if (cluster === "devnet") {
  endpoint = clusterApiUrl("devnet");
}

const App: FC = () => {
  const wallets = [getPhantomWallet()];

  if (isMobile) {
    return <p>Unfortunately, this program only works on a Desktop browser.</p>
  }
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Navigation />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
