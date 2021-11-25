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

  before(async () => {
    // Create FooCoin mint.
    let fooCoinMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create BarCoin mint.
    let barCoinMint = await spl.Token.createMint(
      program.provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      0,
      spl.TOKEN_PROGRAM_ID,
    )
    // Create associated token accounts.
    // Both the `maker` and `taker` will have FooCoin and BarCoin ATAs.
    let makerFooCoinTokenAccount = await fooCoinMint.createAssociatedTokenAccount(wallet.publicKey);
    let makerBarCoinTokenAccount = await barCoinMint.createAssociatedTokenAccount(wallet.publicKey);
    let takerFooCoinTokenAccount = await fooCoinMint.createAssociatedTokenAccount(taker.publicKey);
    let takerBarCoinTokenAccount = await barCoinMint.createAssociatedTokenAccount(taker.publicKey);
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

  it('it lets Will stipulate his desired swap then send his FooCoins to escrow', async () => {
    const swapState = anchor.web3.Keypair.generate();
    const [escrow, escrowBump] = await anchor.web3.PublicKey.findProgramAddress(
      [swapState.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.submit(
      {
        accounts: {
          swapState: swapState.publicKey,
          maker: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [swapState]
      }
    )
  });
});
