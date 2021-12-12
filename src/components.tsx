import React, { FC, useState } from 'react';
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
      <p className='pl-4'>1. Specify FooCoins and BarCoins amounts.</p>
      <p className='pl-4'>2. Press Submit.</p>
      <p className='pl-4'>2. Press Accept.</p>
    </div>
  )
}

const UserInterface: FC = () => {

  const production = true;

  const wallet = useAnchorWallet();
  const connection = useConnection().connection;
  const payer = wallet;
  const maker = anchor.web3.Keypair.generate();
  const taker = anchor.web3.Keypair.generate();

  let fooCoinMint: anchor.web3.PublicKey;
  let fooCoinMintBump: number;
  let barCoinMint: anchor.web3.PublicKey;
  let barCoinMintBump: number;
  let makerFooCoinAssocTokenAcct: anchor.web3.PublicKey;
  let makerBarCoinAssocTokenAcct: anchor.web3.PublicKey;
  let takerFooCoinAssocTokenAcct: anchor.web3.PublicKey;
  let takerBarCoinAssocTokenAcct: anchor.web3.PublicKey;
  let escrowAccount: anchor.web3.PublicKey;
  let escrowAccountBump: number;
  let swapState: anchor.web3.Keypair;

  const initTokenBalance = 100;

  const initialState = {
    submitButtonClicked: false,
    acceptButtonClicked: false,
    willFooCoinBalance: 100,
    alanBarCoinBalance: 100,
    fooCoinAmount: 0,
    barCoinAmount: 0,
  }
  const [state, setState] = useState(initialState);

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

  async function getMintAdresses() {
    // Generate fooCoinMint address (PDA).
    [fooCoinMint, fooCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
      [(new TextEncoder()).encode('foo')], programId
    );
    // Generate barCoinMint address (PDA).
    [barCoinMint, barCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
      [(new TextEncoder()).encode('bar')], programId
    );
  };

  async function initMints() {
    // Initialize mints.
    const program = await getProgram();
    if (wallet && payer && program) {
      let tx = new anchor.web3.Transaction().add(
        program.instruction.initMints(
          fooCoinMintBump,
          barCoinMintBump,
          {
            accounts: {
              fooCoinMint: fooCoinMint,
              barCoinMint: barCoinMint,
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

  async function resetEscrow() {
    await getMintAdresses();
    if (!production) {
      await initMints();
    }
    const program = await getProgram();
    if (wallet && payer && program) {
      // Create maker and taker FooCoin and BarCoin ATAs.
      makerFooCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        fooCoinMint,
        maker.publicKey
      );
      makerBarCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        barCoinMint,
        maker.publicKey
      );
      takerFooCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        fooCoinMint,
        taker.publicKey
      );
      takerBarCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        barCoinMint,
        taker.publicKey
      );
      // Generate swap state address.
      swapState = anchor.web3.Keypair.generate();
      // Generate escrow account address (PDA).
      [escrowAccount, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
        [swapState.publicKey.toBuffer()],
        program.programId
      );
      // Send instructions necessary prior to initializing escrow.
      let tx = new anchor.web3.Transaction().add(
        // Initialize maker associated token accounts.
        program.instruction.initMakerAssocTokenAccts(
          {
            accounts: {
              fooCoinMint: fooCoinMint,
              barCoinMint: barCoinMint,
              makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
              makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              payer: payer.publicKey,
              maker: maker.publicKey,
              associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          }
        )
      ).add(
        // Initialize maker associated token accounts.
        program.instruction.initTakerAssocTokenAccts(
          {
            accounts: {
              fooCoinMint: fooCoinMint,
              barCoinMint: barCoinMint,
              takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
              takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              payer: payer.publicKey,
              taker: taker.publicKey,
              associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          }
        )
      ).add(
        // Mint FooCoins and BarCoins to maker and taker respectively.
        program.instruction.resetAssocTokenAcctBalances(
          fooCoinMintBump,
          barCoinMintBump,
          new anchor.BN(initTokenBalance),
          {
            accounts: {
              fooCoinMint: fooCoinMint,
              barCoinMint: barCoinMint,
              makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
              takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              payer: payer.publicKey,
              maker: maker.publicKey,
              taker: taker.publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId
            },
          }
        )
      ).add(
        program.instruction.initEscrow(
          escrowAccountBump,
          {
            accounts: {
              fooCoinMint: fooCoinMint,
              swapState: swapState.publicKey,
              escrowAccount: escrowAccount,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              payer: payer.publicKey,
              tokenProgram: spl.TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId
            }
          },
        )
      )
      await program.provider.send(tx, [maker, taker, swapState], opts as ConfirmOptions);
    }
    setState({
      ...initialState
    })
  }

  function submitEscrow() {
    console.log('submitting escrow!');
  }

  function acceptEscrow() {
    console.log('accepting escrow!');
  }

  function escrowValid(): boolean {
    return (
      (
        Boolean(state['fooCoinAmount']) && (state['fooCoinAmount'] <= state['willFooCoinBalance'])
      ) && (
        Boolean(state['barCoinAmount']) && (state['barCoinAmount'] <= state['alanBarCoinBalance'])
      )
    )
  }

  function handleIxButtonClick(buttonName: string) {
    if (escrowValid()) {
      setState({
        ...state,
        [buttonName + 'ButtonClicked']: true
      })
      if (buttonName === 'submit') {
        submitEscrow()
      } else if (buttonName === 'accept') {
        acceptEscrow()
      }
    } else {
      resetEscrow()
    }
  }

  function handleResetButtonClick() {
    resetEscrow()
  }

  function updateCoinAmount(event: any, coinAmount: string) {
    let amount = event.target.value;
    setState({
      ...state,
      [coinAmount]: amount ? Number(amount) : null
    })
  }

  const submitButtonClassName = (escrowValid() && !state['submitButtonClicked']) ? 'valid-ix-button' : 'invalid-ix-button';
  const acceptButtonClassName = (state['submitButtonClicked'] && !state['acceptButtonClicked']) ? 'valid-ix-button' : 'invalid-ix-button';

  return(
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
                        <div className="text-green-500 text-2xl">{state['willFooCoinBalance']}</div>
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
                        <div className="text-green-500 text-2xl">{state['alanBarCoinBalance']}</div>
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
                          disabled={state['submitButtonClicked']}
                          placeholder={'max: ' + state['willFooCoinBalance']}
                          value={state['fooCoinAmount'] || ''}
                          onChange={(event) => updateCoinAmount(event, 'fooCoinAmount')}
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
                          disabled={state['submitButtonClicked']}
                          placeholder={'max: ' + state['alanBarCoinBalance']}
                          value={state['barCoinAmount'] || ''}
                          onChange={(event) => updateCoinAmount(event, 'barCoinAmount')}
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
              <button className={submitButtonClassName} onClick={() => handleIxButtonClick('submit')}>Submit</button>
              <button className={acceptButtonClassName} onClick={() => {if (state['submitButtonClicked']) {handleIxButtonClick('accept')}}}>Accept</button>
              <button className='reset-button' onClick={() => handleResetButtonClick()}>Reset</button>
            </div>
          </div>
        </div>
      </section>
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
