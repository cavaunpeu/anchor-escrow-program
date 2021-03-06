import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { Program } from '@project-serum/anchor';
import { AnchorEscrowProgram } from '../target/types/anchor_escrow_program';
import * as assert from 'assert';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';

describe('anchor-escrow-program', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorEscrowProgram as Program<AnchorEscrowProgram>;
  const wallet = program.provider.wallet;
  const payer = wallet;
  const maker = anchor.web3.Keypair.generate();
  const taker = anchor.web3.Keypair.generate();

  let makerFooCoinAssocTokenAcct: anchor.web3.PublicKey;
  let makerBarCoinAssocTokenAcct: anchor.web3.PublicKey;
  let takerFooCoinAssocTokenAcct: anchor.web3.PublicKey;
  let takerBarCoinAssocTokenAcct: anchor.web3.PublicKey;
  let fooCoinMint: anchor.web3.PublicKey;
  let fooCoinMintBump: number;
  let barCoinMint: anchor.web3.PublicKey;
  let barCoinMintBump: number;
  let escrowAccount: anchor.web3.PublicKey;
  let escrowAccountBump: number;
  let swapState: anchor.web3.Keypair;

  const initTokenBalance = 100;
  const fooCoinAmount = 10;
  const barCoinAmount = 22;

  before(async () => {
    // Generate fooCoinMint address (PDA).
    [fooCoinMint, fooCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
      [(new TextEncoder()).encode('foo')], program.programId
    );
    // Generate barCoinMint address (PDA).
    [barCoinMint, barCoinMintBump] = await anchor.web3.PublicKey.findProgramAddress(
      [(new TextEncoder()).encode('bar')], program.programId
    );
    // Initialize mints.
    await program.rpc.initMints(
      fooCoinMintBump,
      barCoinMintBump,
      {
        accounts: {
          barCoinMint: barCoinMint,
          payer: payer.publicKey,
          fooCoinMint: fooCoinMint,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId
        }
      }
    );
  })

  beforeEach(async () => {
    // Create associated token accounts.
    // Both the `maker` and `taker` will have FooCoin and BarCoin ATAs.
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

    // Initialize maker associated token accounts.
    await program.rpc.initMakerAssocTokenAccts(
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
        },
        signers: [maker]
      }
    );
    // Initialize maker associated token accounts.
    await program.rpc.initTakerAssocTokenAccts(
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
        },
        signers: [taker]
      }
    );
    // Mint FooCoins and BarCoins to maker and taker respectively.
    await program.rpc.resetAssocTokenAcctBalances(
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
        signers: [maker, taker]
      }
    );
    // Generate swap state address.
    swapState = anchor.web3.Keypair.generate();
    // Generate escrow account address (PDA).
    [escrowAccount, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [swapState.publicKey.toBuffer()],
      program.programId
    );
    // Initialize escrow.
    await program.rpc.initEscrow(
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
        },
        signers: [swapState]
      },
    );
  });

  let assertGracefulCleanup = async () => {
    assert.equal(null, await program.provider.connection.getAccountInfo(swapState.publicKey));
    assert.equal(null, await program.provider.connection.getAccountInfo(escrowAccount));
  };

  let assertNotGracefulCleanup = async () => {
    assert.notEqual(null, await program.provider.connection.getAccountInfo(swapState.publicKey));
    assert.notEqual(null, await program.provider.connection.getAccountInfo(escrowAccount));
  };

  it('lets maker submit and taker accept a transaction', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          barCoinMint: barCoinMint,
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [maker]
      }
    );

    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(escrowAccount)).value.amount),
      fooCoinAmount
    );
    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(makerFooCoinAssocTokenAcct)).value.amount),
      initTokenBalance - fooCoinAmount
    );

    await program.rpc.accept(
      {
        accounts: {
          swapState: swapState.publicKey,
          takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
          // In a real app, taker will need to get/compute this value from their client.
          makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
          payer: payer.publicKey,
          // In a real app, taker will need to get/compute this value from their client.
          maker: maker.publicKey,
          taker: taker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [taker]
      }
    );

    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(makerBarCoinAssocTokenAcct)).value.amount),
      barCoinAmount
    );
    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(takerBarCoinAssocTokenAcct)).value.amount),
      initTokenBalance - barCoinAmount
    );
    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(takerFooCoinAssocTokenAcct)).value.amount),
      fooCoinAmount
    );

    await assertGracefulCleanup();

  });

  it('lets maker submit and maker cancel transaction', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          barCoinMint: barCoinMint,
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [maker]
      }
    );

    await program.rpc.cancel(
      {
        accounts: {
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [maker]
      }
    );

    assert.equal(
      parseInt((await program.provider.connection.getTokenAccountBalance(makerFooCoinAssocTokenAcct)).value.amount),
      initTokenBalance
    );
    await assertGracefulCleanup();

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
            // In a real app, taker will need to get/compute this value from their client.
            makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
            escrowAccount: escrowAccount,
            takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
            payer: payer.publicKey,
            // In a real app, taker will need to get/compute this value from their client.
            maker: maker.publicKey,
            taker: taker.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.code, 167);
      assert.equal(err.msg, 'The given account is not owned by the executing program');
    }
  });

  it('does not let taker send the wrong kind of tokens', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          barCoinMint: barCoinMint,
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [maker]
      }
    );

    // Create ErroneousCoin mint.
    const erroneousCoinMint = await spl.Token.createMint(
      program.provider.connection,
      (payer as NodeWallet).payer,
      payer.publicKey,
      payer.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create taker ErroneousCoin ATA.
    const takerErroneousCoinAssocTokenAccount = await erroneousCoinMint.createAssociatedTokenAccount(payer.publicKey);
    // Mint ErroneousCoins to taker ErroneousCoin ATA.
    await erroneousCoinMint.mintTo(
      takerErroneousCoinAssocTokenAccount,
      payer.publicKey,
      [],
      100
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            takerBarCoinAssocTokenAcct: takerErroneousCoinAssocTokenAccount,
            // In a real app, taker will need to get/compute this value from their client.
            makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
            escrowAccount: escrowAccount,
            takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
            payer: payer.publicKey,
            // In a real app, taker will need to get/compute this value from their client.
            maker: maker.publicKey,
            taker: taker.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.code, 149);
      assert.equal(err.msg, 'An associated constraint was violated');
    }

    await assertNotGracefulCleanup();
  })

  it('does not let maker submit a swap for which they have insufficient funds', async () => {
    try {
      await program.rpc.submit(
        escrowAccountBump,
        new anchor.BN(initTokenBalance + 1),
        new anchor.BN(barCoinAmount),
        {
          accounts: {
            barCoinMint: barCoinMint,
            swapState: swapState.publicKey,
            makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
            escrowAccount: escrowAccount,
            payer: payer.publicKey,
            maker: maker.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [maker]
        }
      );
    } catch (err) {
      assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1');
      assert.equal(err.logs[3], 'Program log: Error: insufficient funds');
    }

    await assertNotGracefulCleanup();
  })

  it('does not let taker accept a swap for which they have insufficient funds', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(initTokenBalance),
      new anchor.BN(initTokenBalance + 1),
      {
        accounts: {
          barCoinMint: barCoinMint,
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [maker]
      }
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
            // In a real app, taker will need to get/compute this value from their client.
            makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
            escrowAccount: escrowAccount,
            takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
            payer: payer.publicKey,
            // In a real app, taker will need to get/compute this value from their client.
            maker: maker.publicKey,
            taker: taker.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1');
      assert.equal(err.logs[3], 'Program log: Error: insufficient funds');
    }

    await assertNotGracefulCleanup();
  })

  it('does not let taker send tokens to an ATA which maker does not own', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          barCoinMint: barCoinMint,
          swapState: swapState.publicKey,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          escrowAccount: escrowAccount,
          payer: payer.publicKey,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [maker]
      }
    );

    // Create rando keypair.
    const rando = anchor.web3.Keypair.generate();
    // Create BarCoin ATA for rando.
    const randoBarCoinAssocTokenAcct = await spl.Token.getAssociatedTokenAddress(
      spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      spl.TOKEN_PROGRAM_ID,
      barCoinMint,
      rando.publicKey
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
            // Not owned by maker!
            makerBarCoinAssocTokenAcct: randoBarCoinAssocTokenAcct,
            escrowAccount: escrowAccount,
            takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
            payer: payer.publicKey,
            // In a real app, taker will need to get/compute this value from their client.
            maker: maker.publicKey,
            taker: taker.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.code, 167);
      assert.equal(err.msg, 'The given account is not owned by the executing program');
    }

    await assertNotGracefulCleanup();
  })
});
