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
        let initial_storage = Pubkey::find_program_address(&[b"init"], ctx.program_id);
        let (initial_storage, initial_storage_bump_seed) = initial_storage;
        assert_eq!(&initial_storage, ctx.accounts.initial_storage.key);

        {
            let from = ctx.accounts.payer.key;
            let to = ctx.accounts.initial_storage.key;
            let space = 2;
            let lamports = 10000;
            let owner = ctx.program_id;

            invoke_signed(
                &system_instruction::create_account(
                    from, to, space, lamports, owner
                ),
                &[
                    ctx.accounts.payer.clone(),
                    ctx.accounts.initial_storage.clone(),
                    ctx.accounts.system_program.clone(),
                ],
                &[
                    &[
                        b"init",
                        &[initial_storage_bump_seed]
                    ]
                ],
            )?;
        }

        ctx.accounts.storage_reference.storage = initial_storage;

        Ok(())
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
    #[account(signer)]
    pub base: AccountInfo<'info>,
    #[account(zero)]
    pub storage_reference: ProgramAccount<'info, StorageReference>,
    #[account(
        mut,
        constraint = initial_storage.owner == &system_program::ID,
        constraint = initial_storage.data.borrow().is_empty(),
    )]
    pub initial_storage: AccountInfo<'info>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
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
