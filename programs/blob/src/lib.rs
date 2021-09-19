#![allow(unused)]

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod blob {
    use super::*;

    pub fn set(
        ctx: Context<Set>,
        base: Pubkey,
        key: String,
        value: Vec<u8>,
        lamports: u64,
    ) -> ProgramResult {
        todo!()
    }

    pub fn get(
        ctx: Context<Get>,
        base: Pubkey,
        key: String,
    ) -> Result<Option<Vec<u8>>, ProgramError> {
        todo!()
    }

    pub fn delete(
        ctx: Context<Delete>,
        base: Pubkey,
        key: String
    ) -> Result<bool, ProgramError> {
        todo!()
    }
}

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub base: Signer<'info>,
}

#[derive(Accounts)]
pub struct Get {
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub base: Signer<'info>,
}
