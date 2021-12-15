import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header: FC = () => {
  return (
    <header>
      <nav className="flex items-center text-indigo-300">
        <p className="text-indigo-100 text-4xl font-mono">Anchor Escrow Program</p>
        <ul className="flex items-center justify-end flex-grow uppercase text-2xl font-mono">
          <li className="pl-8 hover:text-indigo-100 cursor-pointer">Code</li>
          <li className="pl-8 hover:text-indigo-100 cursor-pointer">Author</li>
          <li className="pl-8 ">
            <WalletMultiButton />
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header;