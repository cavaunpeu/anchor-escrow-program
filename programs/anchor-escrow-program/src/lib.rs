use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod anchor_escrow_program {
    use super::*;
    pub fn submit(
        ctx: Context<Submit>,
        foo_coin_amount: u8,
        bar_coin_amount: u8
    ) -> ProgramResult {
        // Set properties on swap state
        let swap_state = &mut ctx.accounts.swap_state;
        swap_state.bar_coin_amount = bar_coin_amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Submit<'info> {
    #[account(init, payer = maker, space = 8 + 8)]
    pub swap_state: Account<'info, SwapState>,
    #[account(mut)]
    pub maker: Signer<'info>,
    pub maker_foo_coin_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct SwapState {
    bar_coin_amount: u8
}
