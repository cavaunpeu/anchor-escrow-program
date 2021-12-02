import React from 'react';
import ReactDOM from 'react-dom';
import '../css/tailwind.css';

ReactDOM.render(
  <React.StrictMode>
    <div className="bg-gray-800 p-8">
        <header>
            <nav className="flex text-indigo-300">
                <p className="text-indigo-100 text-4xl font-mono">Anchor Escrow Program</p>
                <ul className="flex self-center justify-end flex-grow uppercase text-2xl font-mono">
                    <li className="pl-8 hover:text-indigo-200 cursor-pointer">Code</li>
                    <li className="pl-8 hover:text-indigo-200 cursor-pointer">Author</li>
                </ul>
            </nav>
        </header>
        <div className="flex flex-col justify-center h-screen max-w-screen-lg w-2/5 text-indigo-100 text-2xl font-mono leading-loose">
            <p>
                In an escrow, <span className="text-indigo-300">Will</span> wants to exchange <span className="text-pink-300">FooCoins</span> for <span className="text-indigo-300">Alan's</span> <span className="text-pink-300">BarCoins</span>.

                To do so, <span className="text-indigo-300">Will</span> sends his <span className="text-pink-300">FooCoins</span> to a neutral "escrow" account.

                Once his coins have arrived, <span className="text-indigo-300">Alan</span> sends his <span className="text-pink-300">BarCoins</span> to <span className="text-indigo-300">Will</span>, and the escrow sends its <span className="text-pink-300">FooCoins</span> to <span className="text-indigo-300">Alan</span>.

                Both transactions are atomic: if anything goes wrong, they are rolled back.
            </p>
        </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

