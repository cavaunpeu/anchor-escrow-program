import { FC, useState, useEffect } from 'react';
import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { ConfirmOptions } from '@solana/web3.js'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import AccountBalances from './AccountBalances';
import EscrowTerms from './EscrowTerms';
import Buttons from './Buttons';
import idl from './idl.json';
import config from './config.json';

const programId = new anchor.web3.PublicKey(idl.metadata.address);
const opts = {
  preflightCommitment: "processed"
};

const UserInterface: FC = () => {

  // Read config.
  const initTokenBalance = config.initTokenBalance;

  // Use wallet and connection.
  const wallet = useAnchorWallet();
  const connection = useConnection().connection;
  const payer = wallet;

  // Set initial state.
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

  // Set addresses.
  const dummyKeypair = anchor.web3.Keypair.generate();
  const dummyPubkey = dummyKeypair.publicKey;

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

  async function initializeEscrow() {
    const program = await getProgram();
    if (payer && program) {
      const tx = new anchor.web3.Transaction()
      .add(
        // Initialize mints.
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
      ).add(
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
      setState({
        ...initialState,
        escrowInitialized: (state['submitButtonClicked'] && state['acceptButtonClicked']) ? false : state['escrowInitialized']
      });
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
        AccountBalances
        willFooCoinBalance={state['willFooCoinBalance']}
        willBarCoinBalance={state['willBarCoinBalance']}
        alanFooCoinBalance={state['alanFooCoinBalance']}
        alanBarCoinBalance={state['alanBarCoinBalance']}
        escrowBalance={state['escrowBalance']}
      />
      <
        EscrowTerms
        escrowInitialized={state['escrowInitialized']}
        submitButtonClicked={state['submitButtonClicked']}
        willFooCoinBalance={state['willFooCoinBalance']}
        alanBarCoinBalance={state['alanBarCoinBalance']}
        fooCoinAmount={state['fooCoinAmount']}
        barCoinAmount={state['barCoinAmount']}
        updateCoinAmount={updateCoinAmount}
      />
      <
        Buttons
        escrowInitialized={state['escrowInitialized']}
        escrowValid={escrowValid}
        submitButtonClicked={state['submitButtonClicked']}
        acceptButtonClicked={state['acceptButtonClicked']}
        handleIxButtonClick={handleIxButtonClick}
      />
    </div>
  );
}

export default UserInterface;
