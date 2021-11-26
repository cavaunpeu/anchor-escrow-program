import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { Program } from '@project-serum/anchor';
import { AnchorEscrowProgram } from '../target/types/anchor_escrow_program';

describe('anchor-escrow-program', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.AnchorEscrowProgram as Program<AnchorEscrowProgram>;
  const wallet = program.provider.wallet;
  const taker = anchor.web3.Keypair.generate();

  let fooCoinMint: spl.Token;
  let barCoinMint: spl.Token;
  let makerFooCoinTokenAccount: anchor.web3.publicKey;
  let makerBarCoinTokenAccount: anchor.web3.publicKey;
  let takerFooCoinTokenAccount: anchor.web3.publicKey;
  let takerBarCoinTokenAccount: anchor.web3.publicKey;

  before(async () => {
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
    fooCoinMint.mintTo(
      makerFooCoinTokenAccount,
      wallet.publicKey,
      [],
      100
    );
    barCoinMint.mintTo(
      takerBarCoinTokenAccount,
      wallet.publicKey,
      [],
      100
    );
  });

  it('it lets maker stipulate her desired swap then send her FooCoins to escrow', async () => {
    const swapState = anchor.web3.Keypair.generate();
    const [escrowAccount, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [swapState.publicKey.toBuffer()],
      program.programId
    );
    const fooCoinAmount = new anchor.BN(10);
    const barCoinAmount = new anchor.BN(22);

    await program.rpc.submit(
      escrowAccountBump,
      fooCoinAmount,
      barCoinAmount,
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          fooCoinMint: fooCoinMint.publicKey,
          makerFooCoinTokenAccount: makerFooCoinTokenAccount,
          escrowAccount: escrowAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [swapState]
      }
    )
  });
});
