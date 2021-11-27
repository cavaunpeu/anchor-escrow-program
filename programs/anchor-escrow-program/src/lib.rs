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
        swap_state.maker = ctx.accounts.maker.key();
        swap_state.bar_coin_amount = bar_coin_amount;
        swap_state.escrow_account_bump = escrow_account_bump;
        // Transfer FooCoin's from maker's FooCoin ATA to escrow
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.maker_foo_coin_token_account.to_account_info(),
                    to: ctx.accounts.escrow_account.to_account_info(),
                    authority: ctx.accounts.maker.to_account_info()
                }
            ),
            foo_coin_amount
        )
    }

    pub fn accept(
        ctx: Context<Accept>
    ) -> ProgramResult {
        // Transfer BarCoin's from taker's BarCoin ATA to maker's BarCoin ATA
        let bar_coin_amount = ctx.accounts.swap_state.bar_coin_amount;
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.taker_bar_coin_token_account.to_account_info(),
                    to: ctx.accounts.maker_bar_coin_token_account.to_account_info(),
                    authority: ctx.accounts.taker.to_account_info()
                }
            ),
            bar_coin_amount
        )
    }
}

#[derive(Accounts)]
#[instruction(escrow_account_bump: u8)]
pub struct Submit<'info> {
    #[account(init, payer = maker, space = 8 + 32 + 8 + 1)]
    pub swap_state: Account<'info, SwapState>,
    #[account(mut, constraint = maker_foo_coin_token_account.mint == foo_coin_mint.key())]
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

#[derive(Accounts)]
pub struct Accept<'info> {
    #[account(constraint = swap_state.maker == *maker.key)]
    pub swap_state: Account<'info, SwapState>,
    #[account(mut, constraint = maker_bar_coin_token_account.mint == bar_coin_mint.key())]
    pub maker_bar_coin_token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = taker_bar_coin_token_account.mint == bar_coin_mint.key())]
    pub taker_bar_coin_token_account: Account<'info, TokenAccount>,
    pub maker: AccountInfo<'info>,
    pub taker: Signer<'info>,
    pub foo_coin_mint: Account<'info, Mint>,
    pub bar_coin_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>
}

#[account]
pub struct SwapState {
    maker: Pubkey,
    bar_coin_amount: u64,
    escrow_account_bump: u8
}
