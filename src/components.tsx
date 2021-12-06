import React from 'react';

const Description = () => {
    return (
        <div className="text-indigo-100 text-2xl font-mono leading-loose">
            <p className='pb-12'>
                In an escrow, <span className="text-indigo-300">Will</span> wants to exchange <span className="text-pink-300">FooCoins</span> for <span className="text-indigo-300">Alan's</span> <span className="text-pink-300">BarCoins</span>.

                To do so, <span className="text-indigo-300">Will</span> sends his <span className="text-pink-300">FooCoins</span> to a neutral "escrow" account.

                Once his coins have arrived, <span className="text-indigo-300">Alan</span> sends his <span className="text-pink-300">BarCoins</span> to <span className="text-indigo-300">Will</span>, and the escrow sends its <span className="text-pink-300">FooCoins</span> to <span className="text-indigo-300">Alan</span>.

                Both transactions are atomic: if anything goes wrong, they are rolled back.
            </p>
            <p className='pb-4'>Instructions:</p>
            <p className='pl-4'>1. Specify FooCoins and BarCoins amounts.</p>
            <p className='pl-4'>2. Press Submit.</p>
            <p className='pl-4'>2. Press Accept.</p>
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

type EscrowProgramState = {
    submitButtonClicked: boolean,
    acceptButtonClicked: boolean,
    willFooCoinBalance: number,
    alanBarCoinBalance: number,
    fooCoinAmount: number,
    barCoinAmount: number,
}

class EscrowProgram extends React.Component<{}, EscrowProgramState> {

    initialState = {
        submitButtonClicked: false,
        acceptButtonClicked: false,
        willFooCoinBalance: 100,
        alanBarCoinBalance: 100,
        fooCoinAmount: null,
        barCoinAmount: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.initialState
        }
    }

    escrowValid() {
        return (
            (
                Boolean(this.state.fooCoinAmount) && (this.state.fooCoinAmount <= this.state.willFooCoinBalance)
            ) && (
                Boolean(this.state.barCoinAmount) && (this.state.barCoinAmount <= this.state.alanBarCoinBalance)
            )
        )
    }

    handleIxButtonClick(buttonName) {
        if (this.escrowValid()) {
            this.setState({
                ...this.state,
                [buttonName + 'ButtonClicked']: true
            })
        } else {
            this.setState({
                ...this.initialState,
            })
        }
    }

    handleResetButtonClick() {
        this.setState({
            ...this.initialState
        })
    }

    updateCoinAmount(event, coinAmount) {
        let amount = event.target.value;
        this.setState({
            ...this.state,
            [coinAmount]: amount ? Number(amount) : null
        })
    }

    render() {
        const submitButtonClassName = (this.escrowValid() && !this.state.submitButtonClicked) ? 'valid-ix-button' : 'invalid-ix-button';
        const acceptButtonClassName = (this.state.submitButtonClicked && !this.state.acceptButtonClicked) ? 'valid-ix-button' : 'invalid-ix-button';

        return (
            <div className='flex flex-col justify-start h-screen w-full font-mono'>
                <section className="antialiased text-light-gray">
                    <div className="flex flex-col">
                        <div className="w-full mx-auto bg-dark-grey shadow-2xl rounded-2xl border border-gray-600">
                            <header className="px-5 py-4 border-b border-light-gray">
                                <h2 className="font-semibold">Account Balances</h2>
                            </header>
                            <div className="p-3">
                                <div className="overflow-x-auto">
                                    <table className="table-fixed w-full justify-center align-middle self-center">
                                        <thead className="text-xs font-extrabold uppercase">
                                            <tr>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Account</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Coin</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Balance</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-md divide-y divide-light-gray text-light-gray text-left font-medium">
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg" width="40" height="40" alt="Will"></img></div>
                                                        <div>Will</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div>FooCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-green-500 text-2xl">{this.state.willFooCoinBalance}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg" width="40" height="40" alt="Alan"></img></div>
                                                        <div>Alan</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div>BarCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-green-500 text-2xl">{this.state.alanBarCoinBalance}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-09.jpg" width="40" height="40" alt="Escrow"></img></div>
                                                        <div>Escrow</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div>FooCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-2xl">0</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="antialiased pt-8 text-light-gray">
                    <div className="flex flex-col">
                        <div className="w-full mx-auto bg-dark-grey shadow-2xl rounded-2xl border border-gray-600">
                            <header className="px-5 py-4 border-b border-light-gray">
                                <h2 className="font-semibold">Escrow Terms</h2>
                            </header>
                            <div className="p-3">
                                <div className="overflow-x-auto">
                                    <table className="table-fixed w-full justify-center align-middle self-center">
                                        <thead className="text-xs font-extrabold uppercase">
                                            <tr>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Account</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Coin</div>
                                                </th>
                                                <th className="p-2 whitespace-nowrap">
                                                    <div className="font-semibold text-left">Amount</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-md divide-y divide-light-gray font-medium">
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg" width="40" height="40" alt="Will"></img></div>
                                                        <div>Will</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">FooCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <input
                                                        disabled={this.state.submitButtonClicked}
                                                        placeholder={'max: ' + this.state.willFooCoinBalance}
                                                        value={this.state.fooCoinAmount || ''}
                                                        onChange={(event) => this.updateCoinAmount(event, 'fooCoinAmount')}
                                                        className='input-field bg-dark-grey'
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg" width="40" height="40" alt="Alan"></img></div>
                                                        <div className="font-medium">Alan</div>
                                                    </div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <div className="text-left">BarCoins</div>
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <input
                                                        disabled={this.state.submitButtonClicked}
                                                        placeholder={'max: ' + this.state.alanBarCoinBalance}
                                                        value={this.state.barCoinAmount || ''}
                                                        onChange={(event) => this.updateCoinAmount(event, 'barCoinAmount')}
                                                        className='input-field bg-dark-grey'
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="antialiased text-gray-600 pt-8">
                    <div className="flex flex-col">
                        <div className="w-full mx-auto">
                            <div className='grid grid-cols-3 gap-12 text-gray-900'>
                                <button className={submitButtonClassName} onClick={() => this.handleIxButtonClick('submit')}>Submit</button>
                                <button className={acceptButtonClassName} onClick={() => {if (this.state.submitButtonClicked) {this.handleIxButtonClick('accept')}}}>Accept</button>
                                <button className='reset-button' onClick={() => this.handleResetButtonClick()}>Reset</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

export { Description, Header, EscrowProgram };
