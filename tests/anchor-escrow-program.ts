import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { Program } from '@project-serum/anchor';
import { AnchorEscrowProgram } from '../target/types/anchor_escrow_program';
import * as assert from 'assert';

describe('anchor-escrow-program', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorEscrowProgram as Program<AnchorEscrowProgram>;
  const wallet = program.provider.wallet;
  const taker = anchor.web3.Keypair.generate();

  let fooCoinMint: spl.Token;
  let barCoinMint: spl.Token;
  let makerFooCoinTokenAccount: anchor.web3.PublicKey;
  let makerBarCoinTokenAccount: anchor.web3.PublicKey;
  let takerFooCoinTokenAccount: anchor.web3.PublicKey;
  let takerBarCoinTokenAccount: anchor.web3.PublicKey;
  let swapState: anchor.web3.Keypair;
  let escrowAccount: anchor.web3.PublicKey;
  let escrowAccountBump: number;

  const makerFooCoinTokenAccountInitialAmount = 100;
  const takerBarCoinTokenAccountInitialAmount = 100;
  const fooCoinAmount = 10;
  const barCoinAmount = 22;

  beforeEach(async () => {
    // Create FooCoin mint.
    fooCoinMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create BarCoin mint.
    barCoinMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create associated token accounts.
    // Both the `maker` and `taker` will have FooCoin and BarCoin ATAs.
    makerFooCoinTokenAccount = await fooCoinMint.createAssociatedTokenAccount(wallet.publicKey);
    makerBarCoinTokenAccount = await barCoinMint.createAssociatedTokenAccount(wallet.publicKey);
    takerFooCoinTokenAccount = await fooCoinMint.createAssociatedTokenAccount(taker.publicKey);
    takerBarCoinTokenAccount = await barCoinMint.createAssociatedTokenAccount(taker.publicKey);
    // Mint FooCoin to maker and BarCoin to taker.
    await fooCoinMint.mintTo(
      makerFooCoinTokenAccount,
      wallet.publicKey,
      [],
      makerFooCoinTokenAccountInitialAmount
    );
    await barCoinMint.mintTo(
      takerBarCoinTokenAccount,
      wallet.publicKey,
      [],
      takerBarCoinTokenAccountInitialAmount
    );
    // Instantiate swap state and escrow account.
    swapState = anchor.web3.Keypair.generate();
    [escrowAccount, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [swapState.publicKey.toBuffer()],
      program.programId
    );
  });

  it('it lets maker submit and taker accept a transaction', async () => {
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
    assert.equal(null, await program.provider.connection.getAccountInfo(swapState.publicKey));
    assert.equal(null, await program.provider.connection.getAccountInfo(escrowAccount));

  });

  it('it lets maker submit and maker cancel transaction', async () => {
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
    assert.equal(null, await program.provider.connection.getAccountInfo(escrowAccount));
    assert.equal(null, await program.provider.connection.getAccountInfo(swapState.publicKey));

  });
});
