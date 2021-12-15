import React, { FC, useState, useEffect } from 'react';
import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { ConfirmOptions } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from './idl.json';

const programId = new anchor.web3.PublicKey(idl.metadata.address);
const opts = {
  preflightCommitment: "processed"
};

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

const Description: FC = () => {
  return (
    <div className="text-indigo-100 text-2xl font-mono leading-loose">
      <p className='pb-12'>
        In an escrow, <span className="text-indigo-300">Will</span> wants to exchange <span className="text-pink-300">FooCoins</span> for <span className="text-indigo-300">Alan's</span> <span className="text-pink-300">BarCoins</span>.

        To do so, <span className="text-indigo-300">Will</span> sends his <span className="text-pink-300">FooCoins</span> to a neutral "escrow" account.

        Once his coins have arrived, <span className="text-indigo-300">Alan</span> sends his <span className="text-pink-300">BarCoins</span> to <span className="text-indigo-300">Will</span>, and the escrow sends its <span className="text-pink-300">FooCoins</span> to <span className="text-indigo-300">Alan</span>.

        Both transactions are atomic: if anything goes wrong, they are rolled back.
      </p>
      <p className='pb-4'>Instructions:</p>
      <p className='pl-4'>1. <span className="text-indigo-300">Initialize</span> escrow (once).</p>
      <p className='pl-4'>2. Specify <span className='text-pink-300'>FooCoins</span> and <span className='text-pink-300'>BarCoins</span> amounts.</p>
      <p className='pl-4'>3. <span className="text-indigo-300">Submit</span> escrow (as <span className="text-indigo-300">Will</span>).</p>
      <p className='pl-4'>4. <span className="text-indigo-300">Accept</span> escrow (as <span className="text-indigo-300">Alan</span>).</p>
    </div>
  )
}

interface AccountBalances {
  willFooCoinBalance: number
  willBarCoinBalance: number
  alanFooCoinBalance: number
  alanBarCoinBalance: number
  escrowBalance: number
}

function AccountBalancesSection(props: AccountBalances) {
  return (
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
                      <div className="text-green-500 text-2xl">{props.willFooCoinBalance}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img className="rounded-full" src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg" width="40" height="40" alt="Will"></img></div>
                        <div>Will</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div>BarCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">{props.willBarCoinBalance}</div>
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
                      <div>FooCoins</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-green-500 text-2xl">{props.alanFooCoinBalance}</div>
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
                      <div className="text-green-500 text-2xl">{props.alanBarCoinBalance}</div>
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
                      <div className="text-green-500 text-2xl">{props.escrowBalance}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface EscrowTerms {
  escrowInitialized: boolean,
  submitButtonClicked: boolean,
  willFooCoinBalance: number,
  alanBarCoinBalance: number,
  fooCoinAmount: number,
  barCoinAmount: number,
  updateCoinAmount: (event: any, coin: string) => void,
}

function EscrowTermsSection(props: EscrowTerms) {
  return (
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
                        disabled={!props.escrowInitialized || props.submitButtonClicked}
                        placeholder={props.escrowInitialized ? 'max: ' + props.willFooCoinBalance : ''}
                        value={props.fooCoinAmount || ''}
                        onChange={(event) => props.updateCoinAmount(event, 'foo')}
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
                        disabled={!props.escrowInitialized || props.submitButtonClicked}
                        placeholder={props.escrowInitialized ? 'max: ' + props.alanBarCoinBalance : ''}
                        value={props.barCoinAmount || ''}
                        onChange={(event) => props.updateCoinAmount(event, 'bar')}
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
  )
}

interface UserInterfaceButtons {
  escrowInitialized: boolean,
  escrowValid: () => boolean,
  submitButtonClicked: boolean,
  acceptButtonClicked: boolean,
  handleIxButtonClick: (buttonName: string) => void
}

function UserInterfaceButtonsSection(props: UserInterfaceButtons) {
  const initializeButtonClassName = (!props.escrowInitialized) ? 'valid-ix-button' : 'invalid-ix-button';
  const submitButtonClassName = (props.escrowValid() && !props.submitButtonClicked) ? 'valid-ix-button' : 'invalid-ix-button';
  const acceptButtonClassName = (props.submitButtonClicked && !props.acceptButtonClicked) ? 'valid-ix-button' : 'invalid-ix-button';
  const resetButtonClassName = (props.escrowInitialized) ? 'valid-reset-button' : 'invalid-ix-button';

  return (
    <section className="antialiased text-gray-600 pt-8">
      <div className="flex flex-col">
        <div className="w-full mx-auto">
          <div className='grid grid-cols-4 gap-12 text-gray-900'>
            <button className={initializeButtonClassName} onClick={() => props.handleIxButtonClick('initialize')}>Initialize</button>
            <button className={submitButtonClassName} onClick={() => props.handleIxButtonClick('submit')}>Submit</button>
            <button className={acceptButtonClassName} onClick={() => {if (props.submitButtonClicked) {props.handleIxButtonClick('accept')}}}>Accept</button>
            <button className={resetButtonClassName} onClick={() => props.handleIxButtonClick('reset')}>Reset</button>
          </div>
        </div>
      </div>
    </section>
  )
}

const UserInterface: FC = () => {

  const production = false;
  const initTokenBalance = 100;
  const dummyPubkey = new anchor.web3.PublicKey("5RZBsktv2Gwy1hsPbxKf9B39WscqK66cEAaak2JnWTrv");
  const dummyKeypair = anchor.web3.Keypair.generate();

  const wallet = useAnchorWallet();
  const connection = useConnection().connection;
  const payer = wallet;

  const initialState = {
    escrowInitialized: false,
    submitButtonClicked: false,
    acceptButtonClicked: false,
    willFooCoinBalance: initTokenBalance,
    willBarCoinBalance: 0,
    alanFooCoinBalance: 0,
    alanBarCoinBalance: initTokenBalance,
    escrowBalance: 0,
    fooCoinAmount: 0,
    barCoinAmount: 0,
  }
  const [state, setState] = useState(initialState);
  const [addresses, _setAddresses] = useState({
    "maker": dummyKeypair,
    "taker": dummyKeypair,
    "swapState": dummyKeypair,
    "fooCoinMint": dummyPubkey,
    "fooCoinMintBump": -1,
    "barCoinMint": dummyPubkey,
    "barCoinMintBump": -1,
    "escrowAccount": dummyPubkey,
    "escrowAccountBump": -1,
    "makerFooCoinAssocTokenAcct": dummyPubkey,
    "makerBarCoinAssocTokenAcct": dummyPubkey,
    "takerFooCoinAssocTokenAcct": dummyPubkey,
    "takerBarCoinAssocTokenAcct": dummyPubkey,
  });

  useEffect(() => {
    async function setAddresses() {
      // Generate maker keypair.
      const maker = anchor.web3.Keypair.generate();
      // Generate taker keypair.
      const taker = anchor.web3.Keypair.generate();
      // Generate fooCoinMint address (PDA).
      const [fooCoinMint, fooCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
        [(new TextEncoder()).encode('foo')], programId
      );
      // Generate barCoinMint address (PDA).
      const [barCoinMint, barCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
        [(new TextEncoder()).encode('bar')], programId
      );
      // Get maker and taker FooCoin and BarCoin ATAs addresses.
      const makerFooCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        fooCoinMint,
        maker.publicKey
      );
      const makerBarCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        barCoinMint,
        maker.publicKey
      );
      const takerFooCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        fooCoinMint,
        taker.publicKey
      );
      const takerBarCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        barCoinMint,
        taker.publicKey
      );
      // Generate swapState keypair.
      const swapState = anchor.web3.Keypair.generate();
      // Generate escrow account address (PDA).
      const [escrowAccount, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
        [swapState.publicKey.toBuffer()],
        programId
      );
      _setAddresses({
        "maker": maker,
        "taker": taker,
        "swapState": swapState,
        "fooCoinMint": fooCoinMint,
        "fooCoinMintBump": fooCoinMintBump,
        "barCoinMint": barCoinMint,
        "barCoinMintBump": barCoinMintBump,
        "escrowAccount": escrowAccount,
        "escrowAccountBump": escrowAccountBump,
        "makerFooCoinAssocTokenAcct": makerFooCoinAssocTokenAcct,
        "makerBarCoinAssocTokenAcct": makerBarCoinAssocTokenAcct,
        "takerFooCoinAssocTokenAcct": takerFooCoinAssocTokenAcct,
        "takerBarCoinAssocTokenAcct": takerBarCoinAssocTokenAcct
      });
    };
    setAddresses()
  }, [])

  async function getProgram() {
    if (wallet) {
      const provider = new anchor.Provider(
        connection,
        wallet,
        opts.preflightCommitment as ConfirmOptions
      );
      const program = new anchor.Program(idl as anchor.Idl, programId, provider);
      return program
    }
  }

  async function initMints() {
    // Initialize mints.
    const program = await getProgram();
    if (wallet && payer && program) {
      let tx = new anchor.web3.Transaction().add(
        program.instruction.initMints(
          addresses["fooCoinMintBump"],
          addresses["barCoinMintBump"],
          {
            accounts: {
              fooCoinMint: addresses["fooCoinMint"],
              barCoinMint: addresses["barCoinMint"],
              payer: wallet.publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          }
        )
      );
      await program.provider.send(tx, [], opts as ConfirmOptions);
    }
  }

  async function initializeEscrow() {
    const program = await getProgram();
    if (payer && program) {
      if (!production) {
        await initMints()
      }
      const tx = new anchor.web3.Transaction();
      tx.add(
        // Initialize maker associated token accounts.
        program.instruction.initMakerAssocTokenAccts(
          {
            accounts: {
              fooCoinMint: addresses["fooCoinMint"],
              barCoinMint: addresses["barCoinMint"],
              makerFooCoinAssocTokenAcct: addresses["makerFooCoinAssocTokenAcct"],
              makerBarCoinAssocTokenAcct: addresses["makerBarCoinAssocTokenAcct"],
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              payer: payer.publicKey,
              maker: addresses["maker"].publicKey,
              associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          }
        )
      ).add(
        // Initialize taker associated token accounts.
        program.instruction.initTakerAssocTokenAccts(
          {
            accounts: {
              fooCoinMint: addresses["fooCoinMint"],
              barCoinMint: addresses["barCoinMint"],
              takerFooCoinAssocTokenAcct: addresses["takerFooCoinAssocTokenAcct"],
              takerBarCoinAssocTokenAcct: addresses["takerBarCoinAssocTokenAcct"],
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              payer: payer.publicKey,
              taker: addresses["taker"].publicKey,
              associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          }
        )
      ).add(
        // Initialize escrow.
        program.instruction.initEscrow(
          addresses["escrowAccountBump"],
          {
            accounts: {
              fooCoinMint: addresses["fooCoinMint"],
              swapState: addresses["swapState"].publicKey,
              escrowAccount: addresses["escrowAccount"],
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              payer: payer.publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          },
        )
      );
      let signers = [addresses["maker"], addresses["taker"], addresses["swapState"]];
      await program.provider.send(tx, signers, opts as ConfirmOptions);
    }
  }

  async function submitEscrow() {
    const program = await getProgram();
    if (payer && program) {
      const tx = new anchor.web3.Transaction();
      tx.add(
        // Reset maker and taker token account balances.
        program.instruction.resetAssocTokenAcctBalances(
          addresses["fooCoinMintBump"],
          addresses["barCoinMintBump"],
          new anchor.BN(initTokenBalance),
          {
            accounts: {
              fooCoinMint: addresses["fooCoinMint"],
              barCoinMint: addresses["barCoinMint"],
              makerFooCoinAssocTokenAcct: addresses["makerFooCoinAssocTokenAcct"],
              takerBarCoinAssocTokenAcct: addresses["takerBarCoinAssocTokenAcct"],
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              payer: payer.publicKey,
              maker: addresses["maker"].publicKey,
              taker: addresses["taker"].publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId
            },
          }
        )
      ).add(
        // Submit escrow.
        program.instruction.submit(
          addresses["escrowAccountBump"],
          new anchor.BN(state["fooCoinAmount"]),
          new anchor.BN(state["barCoinAmount"]),
          {
            accounts: {
              barCoinMint: addresses["barCoinMint"],
              swapState: addresses["swapState"].publicKey,
              makerFooCoinAssocTokenAcct: addresses["makerFooCoinAssocTokenAcct"],
              escrowAccount: addresses["escrowAccount"],
              payer: payer.publicKey,
              maker: addresses["maker"].publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId,
            }
          }
        )
      );
      await program.provider.send(tx, [addresses["maker"], addresses["taker"]], opts as ConfirmOptions);
    }
  }

  async function acceptEscrow() {
    const program = await getProgram();
    if (payer && program) {
      await program.rpc.accept(
        {
          accounts: {
            swapState: addresses["swapState"].publicKey,
            takerBarCoinAssocTokenAcct: addresses["takerBarCoinAssocTokenAcct"],
            // In a real app, taker will need to get/compute this value from their client.
            makerBarCoinAssocTokenAcct: addresses["makerBarCoinAssocTokenAcct"],
            escrowAccount: addresses["escrowAccount"],
            takerFooCoinAssocTokenAcct: addresses["takerFooCoinAssocTokenAcct"],
            payer: payer.publicKey,
            // In a real app, taker will need to get/compute this value from their client.
            maker: addresses["maker"].publicKey,
            taker: addresses["taker"].publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [addresses["taker"]]
        }
      );
    }
  }

  function resetEscrow() {
    setState({
      ...initialState,
      escrowInitialized: state['escrowInitialized']
    });
  }

  function escrowValid(): boolean {
    return (
      (
        state['escrowInitialized']
      ) && (
        Boolean(state['fooCoinAmount']) && (state['fooCoinAmount'] <= state['willFooCoinBalance'])
      ) && (
        Boolean(state['barCoinAmount']) && (state['barCoinAmount'] <= state['alanBarCoinBalance'])
      )
    )
  }

  async function handleIxButtonClick(buttonName: string) {
    if (buttonName === 'initialize' && !state['escrowInitialized']) {
      initializeEscrow();
      setState({
        ...state,
        "escrowInitialized": true,
      });
    } else if (buttonName === 'submit' && escrowValid()) {
      await submitEscrow();
      setState({
        ...state,
        'submitButtonClicked': true,
        willFooCoinBalance: state['willFooCoinBalance'] - state['fooCoinAmount'],
        escrowBalance: state['fooCoinAmount']
      });
    } else if (buttonName === 'accept' && escrowValid()) {
      await acceptEscrow();
      setState({
        ...state,
        'acceptButtonClicked': true,
        alanBarCoinBalance: state['alanBarCoinBalance'] - state['barCoinAmount'],
        willBarCoinBalance: state['barCoinAmount'],
        alanFooCoinBalance: state['escrowBalance'],
        escrowBalance: 0
      });
    } else if (buttonName === 'reset') {
      resetEscrow();
    }
  }

  function updateCoinAmount(event: any, coin: string) {
    let amount = event.target.value;
    setState({
      ...state,
      [coin + 'CoinAmount']: amount ? Number(amount) : null
    })
  }

  return(
    <div className='flex flex-col justify-start h-screen w-full font-mono'>
      <
        AccountBalancesSection
        willFooCoinBalance={state['willFooCoinBalance']}
        willBarCoinBalance={state['willBarCoinBalance']}
        alanFooCoinBalance={state['alanFooCoinBalance']}
        alanBarCoinBalance={state['alanBarCoinBalance']}
        escrowBalance={state['escrowBalance']}
      />
      <
        EscrowTermsSection
        escrowInitialized={state['escrowInitialized']}
        submitButtonClicked={state['submitButtonClicked']}
        willFooCoinBalance={state['willFooCoinBalance']}
        alanBarCoinBalance={state['alanBarCoinBalance']}
        fooCoinAmount={state['fooCoinAmount']}
        barCoinAmount={state['barCoinAmount']}
        updateCoinAmount={updateCoinAmount}
      />
      <
        UserInterfaceButtonsSection
        escrowInitialized={state['escrowInitialized']}
        escrowValid={escrowValid}
        submitButtonClicked={state['submitButtonClicked']}
        acceptButtonClicked={state['acceptButtonClicked']}
        handleIxButtonClick={handleIxButtonClick}
      />
    </div>
  );
}

export const Navigation: FC = () => {
  return(
    <div className="bg-gray-800 p-8">
      <Header />
      <div className='flex flex-row h-screen py-20'>
        <div className='flex flex-col justify-start w-3/5 px-24'>
          <UserInterface />
        </div>
        <div className='flex flex-col justify-start w-2/5 pr-24'>
          <Description />
        </div>
      </div>
    </div>
  );
}

export default Navigation;
