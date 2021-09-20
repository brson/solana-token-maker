#![allow(unused)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction,
    system_program,
    program::invoke_signed,
    msg,
};

use std::convert::TryFrom;
use std::ops::Deref;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod blob2 {
    use super::*;

    pub fn init(ctx: Context<Init>) -> ProgramResult {
        todo!()
    }

    pub fn set(
        ctx: Context<Set>,
        value: Vec<u8>,
        lamports: u64,
    ) -> ProgramResult {
        todo!()
    }
}

const HEADER_BYTES: usize = 1;
const INITIALIZED: u8 = 0xAE;

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,
    #[account(zero)]
    pub storage_reference: ProgramAccount<'info, StorageReference>,
    #[account(
        mut,
        constraint = initial_storage.owner == &system_program::ID,
        constraint = initial_storage.data.borrow().is_empty()
    )]
    pub initial_storage: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,
    #[account(signer)]
    pub base: AccountInfo<'info>,
    #[account(mut, has_one = storage)]
    pub storage_reference: ProgramAccount<'info, StorageReference>,
    #[account(mut)]
    pub storage: AccountInfo<'info>,
    #[account(
        mut,
        constraint = next_storage.owner == &system_program::ID,
        constraint = next_storage.data.borrow().is_empty()
    )]
    pub next_storage: AccountInfo<'info>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
}

#[account]
pub struct StorageReference {
    pub storage: Pubkey,
}
