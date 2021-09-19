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
        let storage_key = Pubkey::create_with_seed(&base, &key, ctx.program_id)?;
        assert_eq!(&storage_key, ctx.accounts.storage.key);

        let data = ctx.accounts.storage.data.borrow().to_vec();
        if data.is_empty() {
            Ok(None)
        } else {
            Ok(Some(data))
        }
    }
}

#[derive(Accounts)]
pub struct Set<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub base: Signer<'info>,
    pub storage: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Get<'info> {
    pub base: AccountInfo<'info>,
    pub storage: AccountInfo<'info>,
}
