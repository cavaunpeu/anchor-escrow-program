import React from 'react';

const Description = () => {
    return (
        <div className="flex flex-col justify-center h-screen max-w-screen-lg w-2/5 text-indigo-100 text-2xl font-mono leading-loose">
            <p>
                In an escrow, <span className="text-indigo-300">Will</span> wants to exchange <span className="text-pink-300">FooCoins</span> for <span className="text-indigo-300">Alan's</span> <span className="text-pink-300">BarCoins</span>.

                To do so, <span className="text-indigo-300">Will</span> sends his <span className="text-pink-300">FooCoins</span> to a neutral "escrow" account.

                Once his coins have arrived, <span className="text-indigo-300">Alan</span> sends his <span className="text-pink-300">BarCoins</span> to <span className="text-indigo-300">Will</span>, and the escrow sends its <span className="text-pink-300">FooCoins</span> to <span className="text-indigo-300">Alan</span>.

                Both transactions are atomic: if anything goes wrong, they are rolled back.
            </p>
        </div>
    )
}

const Header = () => {
    return (
        <header>
            <nav className="flex text-indigo-300">
                <p className="text-indigo-100 text-4xl font-mono">Anchor Escrow Program</p>
                <ul className="flex self-center justify-end flex-grow uppercase text-2xl font-mono">
                    <li className="pl-8 hover:text-indigo-100 cursor-pointer">Code</li>
                    <li className="pl-8 hover:text-indigo-100 cursor-pointer">Author</li>
                </ul>
            </nav>
        </header>
    )
}

class EscrowProgram extends React.Component<any> {
    render() {
        return (
            <div className='flex justify-center h-full w-full'>
                <section className="antialiased text-gray-600 h-screen">
                    <div className="flex flex-col justify-center h-full">
                        <div className="w-full max-w-2xl mx-auto bg-indigo-50 shadow-2xl rounded-2xl border border-gray-200">
                            <header className="px-5 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800">Escrow</h2>
                            </header>
                            <div className="p-3">
                                <div className="overflow-x-auto">
                                    <table className="table-fixed w-full justify-center align-middle self-center">
                                        <thead className="text-xs font-extrabold uppercase text-gray-400">
                                            <tr>
                                                <th className="p-2 whitespace-nowrap w-5/12">
                                                    <div className="font-semibold text-left">Account</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap w-5/12">
                                                    <div className="font-semibold text-left">Coin</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Balance</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-gray-100">
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg" width="40" height="40" alt="Will"></img></div>
                                                        <div className="font-medium text-gray-800">Will</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">FooCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left font-medium text-green-500">100</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg" width="40" height="40" alt="Alan"></img></div>
                                                        <div className="font-medium text-gray-800">Alan</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">BarCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left font-medium text-green-500">100</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg" width="40" height="40" alt="Escrow"></img></div>
                                                        <div className="font-medium text-gray-800">Escrow</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">FooCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left font-medium">0</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

class AccountBalance extends React.Component<any> {
    render() {
        return (
            <div>
                <div className='text-3xl w-1/2'>
                    <span className='text-pink-300'>{this.props.accountName}:</span>
                    <span className='text-indigo-100'>{this.props.balance}</span>
                </div>
            </div>
        )
    }
}

export { Description, Header, EscrowProgram };
