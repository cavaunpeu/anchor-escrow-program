use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    associated_token::AssociatedToken
};

declare_id!("Bt4LgWEnBfegteNdgErSK4GfD5aXzQxrTAfNhkT1Et2i");

#[program]
pub mod anchor_escrow_program {
    use super::*;
    pub fn init_mints(
        ctx: Context<InitializeMints>,
        foo_coin_mint_bump: u8,
        bar_coin_mint_bump: u8
    ) -> ProgramResult {
        Ok(())
    }

    pub fn init_maker_assoc_token_accts(
        ctx: Context<InitializeMakerATAs>
    ) -> ProgramResult {
        Ok(())
    }

    pub fn init_taker_assoc_token_accts(
        ctx: Context<InitializeTakerATAs>
    ) -> ProgramResult {
        Ok(())
    }

    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        foo_coin_mint_bump: u8,
        bar_coin_mint_bump: u8,
        init_token_balance: u64
    ) -> ProgramResult {
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.foo_coin_mint.to_account_info(),
                    to: ctx.accounts.maker_foo_coin_assoc_token_acct.to_account_info(),
                    authority: ctx.accounts.foo_coin_mint.to_account_info(),
                },
                &[&["foo".as_ref(), &[foo_coin_mint_bump]]],
            ),
            init_token_balance
        )?;
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.bar_coin_mint.to_account_info(),
                    to: ctx.accounts.taker_bar_coin_assoc_token_acct.to_account_info(),
                    authority: ctx.accounts.bar_coin_mint.to_account_info(),
                },
                &[&["bar".as_ref(), &[bar_coin_mint_bump]]],
            ),
            init_token_balance
        )?;
        Ok(())
    }

    pub fn init_escrow(
        ctx: Context<InitializeEscrow>,
        escrow_account_bump: u8
    ) -> ProgramResult {
        Ok(())
    }

    pub fn submit(
        ctx: Context<Submit>,
        escrow_account_bump: u8,
        foo_coin_amount: u64,
        bar_coin_amount: u64,
    ) -> ProgramResult {
        // Set properties on swap state.
        let swap_state = &mut ctx.accounts.swap_state;
        swap_state.maker = ctx.accounts.maker.key();
        swap_state.bar_coin_mint = ctx.accounts.bar_coin_mint.key();
        swap_state.bar_coin_amount = bar_coin_amount;
        swap_state.escrow_account_bump = escrow_account_bump;
        // Transfer FooCoin's from maker's FooCoin ATA to escrow.
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.maker_foo_coin_assoc_token_acct.to_account_info(),
                    to: ctx.accounts.escrow_account.to_account_info(),
                    authority: ctx.accounts.maker.to_account_info()
                }
            ),
            foo_coin_amount
        )
    }
}

    // pub fn accept(
    //     ctx: Context<Accept>
    // ) -> ProgramResult {
    //     // Transfer BarCoin's from taker's BarCoin ATA to maker's BarCoin ATA
    //     let bar_coin_amount = ctx.accounts.swap_state.bar_coin_amount;
    //     anchor_spl::token::transfer(
    //         CpiContext::new(
    //             ctx.accounts.token_program.to_account_info(),
    //             anchor_spl::token::Transfer {
    //                 from: ctx.accounts.taker_bar_coin_token_account.to_account_info(),
    //                 to: ctx.accounts.maker_bar_coin_token_account.to_account_info(),
    //                 authority: ctx.accounts.taker.to_account_info()
    //             }
    //         ),
    //         bar_coin_amount
    //     )?;
    //     // Transfer FooCoin's from escrow to taker's FooCoin ATA
    //     anchor_spl::token::transfer(
    //         CpiContext::new_with_signer(
    //             ctx.accounts.token_program.to_account_info(),
    //             anchor_spl::token::Transfer {
    //                 from: ctx.accounts.escrow_account.to_account_info(),
    //                 to: ctx.accounts.taker_foo_coin_token_account.to_account_info(),
    //                 authority: ctx.accounts.escrow_account.to_account_info()
    //             },
    //             &[&[
    //                 ctx.accounts.swap_state.key().as_ref(),
    //                 &[ctx.accounts.swap_state.escrow_account_bump]
    //             ]]
    //         ),
    //         ctx.accounts.escrow_account.amount
    //     )?;
    //     // Close the escrow account
    //     anchor_spl::token::close_account(CpiContext::new_with_signer(
    //         ctx.accounts.token_program.to_account_info(),
    //         anchor_spl::token::CloseAccount {
    //             account: ctx.accounts.escrow_account.to_account_info(),
    //             destination: ctx.accounts.maker.to_account_info(),
    //             authority: ctx.accounts.escrow_account.to_account_info()
    //         },
    //         &[&[
    //             ctx.accounts.swap_state.key().as_ref(),
    //             &[ctx.accounts.swap_state.escrow_account_bump]
    //         ]]
    //     ))
    // }

//     pub fn cancel(
//         ctx: Context<Cancel>
//     ) -> ProgramResult {
//         // Transfer FooCoin's from escrow to maker's FooCoin ATA
//         anchor_spl::token::transfer(
//             CpiContext::new_with_signer(
//                 ctx.accounts.token_program.to_account_info(),
//                 anchor_spl::token::Transfer {
//                     from: ctx.accounts.escrow_account.to_account_info(),
//                     to: ctx.accounts.maker_foo_coin_token_account.to_account_info(),
//                     authority: ctx.accounts.escrow_account.to_account_info()
//                 },
//                 &[&[
//                     ctx.accounts.swap_state.key().as_ref(),
//                     &[ctx.accounts.swap_state.escrow_account_bump]
//                 ]]
//             ),
//             ctx.accounts.escrow_account.amount
//         )?;
//         // Close the escrow account
//         anchor_spl::token::close_account(CpiContext::new_with_signer(
//             ctx.accounts.token_program.to_account_info(),
//             anchor_spl::token::CloseAccount {
//                 account: ctx.accounts.escrow_account.to_account_info(),
//                 destination: ctx.accounts.maker.to_account_info(),
//                 authority: ctx.accounts.escrow_account.to_account_info()
//             },
//             &[&[
//                 ctx.accounts.swap_state.key().as_ref(),
//                 &[ctx.accounts.swap_state.escrow_account_bump]
//             ]]
//         ))
//     }
// }

#[derive(Accounts)]
#[instruction(foo_coin_mint_bump: u8, bar_coin_mint_bump: u8)]
pub struct InitializeMints<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        seeds = ["foo".as_ref()],
        bump = foo_coin_mint_bump,
        mint::decimals = 0,
        mint::authority = foo_coin_mint
    )]
    pub foo_coin_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = payer,
        seeds = ["bar".as_ref()],
        bump = bar_coin_mint_bump,
        mint::decimals = 0,
        mint::authority = bar_coin_mint
    )]
    pub bar_coin_mint: Account<'info, Mint>,
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct InitializeMakerATAs<'info> {
    pub foo_coin_mint: Account<'info, Mint>,
    pub bar_coin_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = foo_coin_mint,
        associated_token::authority = maker
    )]
    pub maker_foo_coin_assoc_token_acct: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = bar_coin_mint,
        associated_token::authority = maker
    )]
    pub maker_bar_coin_assoc_token_acct: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub maker: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct InitializeTakerATAs<'info> {
    pub foo_coin_mint: Account<'info, Mint>,
    pub bar_coin_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = foo_coin_mint,
        associated_token::authority = taker
    )]
    pub taker_foo_coin_assoc_token_acct: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = bar_coin_mint,
        associated_token::authority = taker
    )]
    pub taker_bar_coin_assoc_token_acct: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub taker: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub foo_coin_mint: Account<'info, Mint>,
    #[account(mut)]
    pub bar_coin_mint: Account<'info, Mint>,
    #[account(mut)]
    pub maker_foo_coin_assoc_token_acct: Account<'info, TokenAccount>,
    #[account(mut)]
    pub taker_bar_coin_assoc_token_acct: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(escrow_account_bump: u8)]
pub struct InitializeEscrow<'info> {
    pub foo_coin_mint: Account<'info, Mint>,
    #[account(init, payer = payer, space = 8 + 32 + 32 + 8 + 1)]
    pub swap_state: Account<'info, SwapState>,
    #[account(
        init,
        payer = payer,
        seeds = [swap_state.key().as_ref()],
        bump = escrow_account_bump,
        token::mint = foo_coin_mint,
        token::authority = escrow_account
    )]
    pub escrow_account: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
pub struct Submit<'info> {
    pub bar_coin_mint: Account<'info, Mint>,
    #[account(mut)]
    pub swap_state: Account<'info, SwapState>,
    #[account(mut)]
    pub maker_foo_coin_assoc_token_acct: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_account: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub maker: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

// #[derive(Accounts)]
// pub struct Accept<'info> {
//     #[account(mut, constraint = swap_state.maker == *maker.key, close = maker)]
//     pub swap_state: Account<'info, SwapState>,
//     #[account(
//         mut,
//         associated_token::mint = swap_state.bar_coin_mint,
//         associated_token::authority = maker
//     )]
//     pub maker_bar_coin_token_account: Account<'info, TokenAccount>,
//     #[account(mut, constraint = taker_bar_coin_token_account.mint == swap_state.bar_coin_mint)]
//     pub taker_bar_coin_token_account: Account<'info, TokenAccount>,
//     #[account(mut, constraint = taker_foo_coin_token_account.mint == escrow_account.mint)]
//     pub taker_foo_coin_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub escrow_account: Account<'info, TokenAccount>,
//     pub maker: AccountInfo<'info>,
//     pub taker: Signer<'info>,
//     pub foo_coin_mint: Account<'info, Mint>,
//     pub token_program: Program<'info, Token>
// }

// #[derive(Accounts)]
// pub struct Cancel<'info> {
//     #[account(mut, constraint = swap_state.maker == *maker.key, close = maker)]
//     pub swap_state: Account<'info, SwapState>,
//     #[account(mut, constraint = maker_foo_coin_token_account.mint == escrow_account.mint)]
//     pub maker_foo_coin_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub escrow_account: Account<'info, TokenAccount>,
//     pub maker: Signer<'info>,
//     pub token_program: Program<'info, Token>
// }

#[account]
pub struct SwapState {
    maker: Pubkey,
    bar_coin_mint: Pubkey,
    bar_coin_amount: u64,
    escrow_account_bump: u8
}
