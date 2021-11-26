use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod anchor_escrow_program {
    use super::*;
    pub fn submit(
        ctx: Context<Submit>,
        escrow_account_bump: u8,
        foo_coin_amount: u64,
        bar_coin_amount: u64,
    ) -> ProgramResult {
        // Set properties on swap state
        let swap_state = &mut ctx.accounts.swap_state;
        swap_state.bar_coin_amount = bar_coin_amount;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(escrow_account_bump: u8)]
pub struct Submit<'info> {
    #[account(init, payer = maker, space = 8 + 8)]
    pub swap_state: Account<'info, SwapState>,
    #[account(constraint = maker_foo_coin_token_account.mint == foo_coin_mint.key())]
    pub maker_foo_coin_token_account: Account<'info, TokenAccount>,
    pub maker: Signer<'info>,
    #[account(
        init,
        payer = maker,
        seeds = [swap_state.key().as_ref()],
        bump = escrow_account_bump,
        token::mint = foo_coin_mint,
        token::authority = escrow_account
    )]
    pub escrow_account: Account<'info, TokenAccount>,
    pub foo_coin_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[account]
pub struct SwapState {
    bar_coin_amount: u64
}
