#![allow(unused)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction,
    program::invoke,
};

use std::convert::TryFrom;
use std::ops::Deref;

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
        let storage_key = Pubkey::create_with_seed(&base, &key, ctx.program_id)?;
        assert_eq!(&storage_key, ctx.accounts.storage.key);

        let from = ctx.accounts.payer.key;
        let to = &storage_key;
        let seed = &key;
        let space = value.len() + HEADER_BYTES;
        let space_u64 = u64::try_from(space).expect("u64");
        let owner = ctx.program_id;

        let create_account_instr = system_instruction::create_account_with_seed(
            from,
            to,
            &base,
            seed,
            lamports,
            space_u64,
            owner
        );

        invoke(
            &create_account_instr,
            &[
                ctx.accounts.payer.deref().clone(),
                ctx.accounts.storage.clone(),
                ctx.accounts.base.deref().clone(),
            ],
        )?;

        let mut storage = ctx.accounts.storage.data.borrow_mut();
        assert_eq!(storage.len(), space);

        storage[1..].copy_from_slice(&value);
        storage[0] = INITIALIZED;

        Ok(())
    }

    pub fn get(
        ctx: Context<Get>,
        base: Pubkey,
        key: String,
    ) -> Result<Option<Vec<u8>>, ProgramError> {
        let storage_key = Pubkey::create_with_seed(&base, &key, ctx.program_id)?;
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
    #[account(mut)]
    pub payer: Signer<'info>,
    pub base: Signer<'info>,
    #[account(mut)]
    pub storage: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Get<'info> {
    pub base: AccountInfo<'info>,
    pub storage: AccountInfo<'info>,
}
