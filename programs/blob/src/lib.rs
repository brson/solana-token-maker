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
pub mod blob {
    use super::*;

    pub fn set(
        ctx: Context<Set>,
        key: String,
        value: Vec<u8>,
        lamports: u64,
    ) -> ProgramResult {
        let (storage_key, storage_bump_seed)
            = Pubkey::find_program_address(
                &[
                    ctx.accounts.base.key.as_ref(),
                    key.as_bytes()
                ],
                ctx.program_id
            );
        assert_eq!(&storage_key, ctx.accounts.storage.key);

        let from = ctx.accounts.payer.key;
        let to = &storage_key;
        let space = value.len() + HEADER_BYTES;
        let space_u64 = u64::try_from(space).expect("u64");
        let owner = ctx.program_id;

        let create_account_instr = system_instruction::create_account(
            from,
            to,
            lamports,
            space_u64,
            owner
        );

        invoke_signed(
            &create_account_instr,
            &[
                ctx.accounts.payer.clone(),
                ctx.accounts.storage.clone(),
                ctx.accounts.system_program.clone(),
            ],
            &[
                &[
                    ctx.accounts.base.key.as_ref(),
                    key.as_bytes(),
                    &[storage_bump_seed]
                ]
            ]
        );

        let mut storage = ctx.accounts.storage.data.borrow_mut();
        assert_eq!(storage.len(), space);

        storage[1..].copy_from_slice(&value);
        storage[0] = INITIALIZED;

        Ok(())
    }

    /* fixme - return value doesn't work */
    pub fn get(
        ctx: Context<Get>,
        key: String,
    ) -> Result<Option<Vec<u8>>, ProgramError> {
        let (storage_key, storage_bump_seed)
            = Pubkey::find_program_address(
                &[
                    ctx.accounts.base.key.as_ref(),
                    key.as_bytes()
                ],
                ctx.program_id
            );
        assert_eq!(&storage_key, ctx.accounts.storage.key);

        let data = ctx.accounts.storage.data.borrow();
        if data.is_empty() {
            Ok(None)
        } else {
            assert_eq!(data[0], INITIALIZED);
            let data = data[1..].to_vec();
            Ok(Some(data))
        }
    }
}

const HEADER_BYTES: usize = 1;
const INITIALIZED: u8 = 0xAE;

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,
    #[account(signer)]
    pub base: AccountInfo<'info>,
    #[account(mut)]
    pub storage: AccountInfo<'info>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Get<'info> {
    pub base: AccountInfo<'info>,
    pub storage: AccountInfo<'info>,
}
