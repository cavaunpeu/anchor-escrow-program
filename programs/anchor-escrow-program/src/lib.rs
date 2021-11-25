use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod anchor_escrow_program {
    use super::*;
    pub fn submit(
        ctx: Context<Initialize>
    ) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = maker, space = 8 + 8)]
    pub swap_state: Account<'info, SwapState>,
    #[account(mut)]
    pub maker: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct SwapState {}
