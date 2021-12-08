import React, { FC } from 'react';
import UserInterface from './components';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';


const App: FC = () => {
    const endpoint = "http://127.0.0.1:8899";
    const wallets = [getPhantomWallet()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <UserInterface />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default App;
