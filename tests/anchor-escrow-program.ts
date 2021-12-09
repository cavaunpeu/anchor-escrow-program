import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { Program } from '@project-serum/anchor';
import { AnchorEscrowProgram } from '../target/types/anchor_escrow_program';
import * as assert from 'assert';
import { idlAddress } from '@project-serum/anchor/dist/cjs/idl';

describe('anchor-escrow-program', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorEscrowProgram as Program<AnchorEscrowProgram>;
  const wallet = program.provider.wallet;
  const payer = wallet.publicKey;
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
    await program.rpc.initializeMints(
      fooCoinMintBump,
      barCoinMintBump,
      {
        accounts: {
          payer: payer,
          fooCoinMint: fooCoinMint,
          barCoinMint: barCoinMint,
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
    await program.rpc.initializeMakerAssocTokenAccts(
      {
        accounts: {
          fooCoinMint: fooCoinMint,
          barCoinMint: barCoinMint,
          makerFooCoinAssocTokenAcct: makerFooCoinAssocTokenAcct,
          makerBarCoinAssocTokenAcct: makerBarCoinAssocTokenAcct,
          payer: payer,
          maker: maker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [maker]
      }
    );
    // Initialize maker associated token accounts.
    await program.rpc.initializeTakerAssocTokenAccts(
      {
        accounts: {
          fooCoinMint: fooCoinMint,
          barCoinMint: barCoinMint,
          takerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
          takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
          payer: payer,
          taker: taker.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [taker]
      }
    );
    // Mint FooCoins and BarCoins to maker and taker respectively.
    await program.rpc.mintTokens(
      fooCoinMintBump,
      barCoinMintBump,
      new anchor.BN(initTokenBalance),
      {
        accounts: {
          fooCoinMint: fooCoinMint,
          barCoinMint: barCoinMint,
          makerFooCoinAssocTokenAcct: takerFooCoinAssocTokenAcct,
          takerBarCoinAssocTokenAcct: takerBarCoinAssocTokenAcct,
          payer: payer,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId
        }
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
    await program.rpc.initializeEscrow(
      escrowAccountBump,
      {
        accounts: {
          fooCoinMint: fooCoinMint,
          swapState: swapState.publicKey,
          escrowAccount: escrowAccount,
          payer: payer,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [swapState]
      },
    );
  });

  it('runs beforeEach', async () => {
    assert.equal(true, true)
  });

  let assertGracefulCleanup = async () => {
    assert.equal(null, await program.provider.connection.getAccountInfo(swapState.publicKey));
    assert.equal(null, await program.provider.connection.getAccountInfo(escrowAccount));
  };

  let assertNotGracefulCleanup = async () => {
    assert.notEqual(null, await program.provider.connection.getAccountInfo(swapState.publicKey));
    assert.notEqual(null, await program.provider.connection.getAccountInfo(escrowAccount));
  };

  xit('lets maker submit and taker accept a transaction', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          barCoinMint: barCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    );

    assert.equal(
      (await fooCoinMint.getAccountInfo(escrowAccount)).amount.toNumber(),
      fooCoinAmount
    );
    assert.equal(
      (await fooCoinMint.getAccountInfo(makerFooCoinTokenAccount)).amount.toNumber(),
      makerFooCoinTokenAccountInitialAmount - fooCoinAmount
    );

    await program.rpc.accept(
      {
        accounts: {
          swapState: swapState.publicKey,
          makerBarCoinTokenAccount: makerBarCoinTokenAccount,
          takerBarCoinTokenAccount: takerBarCoinTokenAccount,
          takerFooCoinTokenAccount: takerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          maker: wallet.publicKey,
          taker: taker.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [taker]
      }
    );

    assert.equal(
      (await barCoinMint.getAccountInfo(takerBarCoinTokenAccount)).amount.toNumber(),
      takerBarCoinTokenAccountInitialAmount - barCoinAmount
    );
    assert.equal(
      (await barCoinMint.getAccountInfo(makerBarCoinTokenAccount)).amount.toNumber(),
      barCoinAmount
    );

    await assertGracefulCleanup();

  });

  xit('lets maker submit and maker cancel transaction', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          barCoinMint: barCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    );

    await program.rpc.cancel(
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        }
      }
    );

    assert.equal(
      (await fooCoinMint.getAccountInfo(makerFooCoinTokenAccount)).amount.toNumber(),
      makerFooCoinTokenAccountInitialAmount
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            makerBarCoinTokenAccount: makerBarCoinTokenAccount,
            takerBarCoinTokenAccount: takerBarCoinTokenAccount,
            takerFooCoinTokenAccount: takerFooCoinTokenAccount,
            escrowAccount: escrowAccount,
            maker: wallet.publicKey,
            taker: taker.publicKey,
            fooCoinMint: fooCoinMint.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.code, 167);
      assert.equal(err.msg, 'The given account is not owned by the executing program');
    }

    await assertGracefulCleanup();
  });

  xit('does not let taker send the wrong kind of tokens', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          barCoinMint: barCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    );

    // Create ErroneousCoin mint.
    const erroneousCoinMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create taker ErroneousCoin ATA.
    const takerErroneousCoinTokenAccount = await erroneousCoinMint.createAssociatedTokenAccount(wallet.publicKey);
    // Mint ErroneousCoins to taker ErroneousCoin ATA.
    await erroneousCoinMint.mintTo(
      takerErroneousCoinTokenAccount,
      wallet.publicKey,
      [],
      100
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            makerBarCoinTokenAccount: makerBarCoinTokenAccount,
            takerBarCoinTokenAccount: takerErroneousCoinTokenAccount,  // not BarCoins!
            takerFooCoinTokenAccount: takerFooCoinTokenAccount,
            escrowAccount: escrowAccount,
            maker: wallet.publicKey,
            taker: taker.publicKey,
            fooCoinMint: fooCoinMint.publicKey,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [taker]
        }
      );
    } catch (err) {
      assert.equal(err.code, 143);
      assert.equal(err.msg, 'A raw constraint was violated');
    }

    await assertNotGracefulCleanup();
  })

  xit('does not let maker submit a swap for which they have insufficient funds', async () => {
    try {
      await program.rpc.submit(
        escrowAccountBump,
        new anchor.BN(makerFooCoinTokenAccountInitialAmount + 1),
        new anchor.BN(barCoinAmount),
        {
          accounts: {
            swapState: swapState.publicKey,
            maker: wallet.publicKey,
            fooCoinMint: fooCoinMint.publicKey,
            barCoinMint: barCoinMint.publicKey,
            makerFooCoinTokenAccount: makerFooCoinTokenAccount,
            escrowAccount: escrowAccount,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [swapState]
        }
      );
    } catch (err) {
      assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1');
      assert.equal(err.logs[11], 'Program log: Error: insufficient funds');
    }

    await assertGracefulCleanup();
  })

  xit('does not let taker accept a swap for which they have insufficient funds', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(takerBarCoinTokenAccountInitialAmount + 1),
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          barCoinMint: barCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            makerBarCoinTokenAccount: makerBarCoinTokenAccount,
            takerBarCoinTokenAccount: takerBarCoinTokenAccount,
            takerFooCoinTokenAccount: takerFooCoinTokenAccount,
            escrowAccount: escrowAccount,
            maker: wallet.publicKey,
            taker: taker.publicKey,
            fooCoinMint: fooCoinMint.publicKey,
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

  xit('does not let taker send tokens to an ATA which maker does not own', async () => {
    await program.rpc.submit(
      escrowAccountBump,
      new anchor.BN(fooCoinAmount),
      new anchor.BN(barCoinAmount),
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          barCoinMint: barCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    );

    // Create rando keypair.
    const rando = anchor.web3.Keypair.generate();
    // Create BarCoin ATA for rando.
    const randoBarCoinTokenAccount = await barCoinMint.createAssociatedTokenAccount(rando.publicKey);
    // Mint BarCoins to rando.
    await barCoinMint.mintTo(
      randoBarCoinTokenAccount,
      wallet.publicKey,
      [],
      100
    );

    try {
      await program.rpc.accept(
        {
          accounts: {
            swapState: swapState.publicKey,
            makerBarCoinTokenAccount: randoBarCoinTokenAccount,  // not owned by maker!
            takerBarCoinTokenAccount: takerBarCoinTokenAccount,
            takerFooCoinTokenAccount: takerFooCoinTokenAccount,
            escrowAccount: escrowAccount,
            maker: wallet.publicKey,
            taker: taker.publicKey,
            fooCoinMint: fooCoinMint.publicKey,
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
});
