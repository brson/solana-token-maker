const anchor = require('@project-serum/anchor');
const assert = require("assert");

describe('blob2', () => {

    // Configure the client to use the local cluster.
    const provider = anchor.Provider.local();
    anchor.setProvider(provider);

    it('Is initialized!', async () => {
        const blob = anchor.workspace.Blob2;

        const payer = anchor.web3.Keypair.generate();

        let airtx = await provider.connection.requestAirdrop(payer.publicKey, anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(airtx);

        let balance = await provider.connection.getBalance(payer.publicKey);
        console.log(`balance ${balance}`);

        const storageReference = await anchor.web3.PublicKey.createWithSeed(
            payer.publicKey,
            "foo",
            blob.programId
        );

        let storageReferenceRent = await provider.connection.getMinimumBalanceForRentExemption(8 + 32);

        let createStorageReferenceInstr = anchor.web3.SystemProgram.createAccountWithSeed({
            basePubkey: payer.publicKey,
            fromPubkey: payer.publicKey,
            lamports: storageReferenceRent,
            newAccountPubkey: storageReference,
            programId: blob.programId,
            seed: "foo",
            space: 8 + 32
        });

        const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                "init",
                storageReference.toBuffer()
            ],
            blob.programId
        );

        await blob.rpc.init({
            accounts: {
                payer: payer.publicKey,
                storageReference: storageReference,
                /*initialStorage: initialStorage,*/
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [
                payer
            ],
            instructions: [
                createStorageReferenceInstr
            ]
        });

        let val = await blob.account.storageReference.fetch(storageReference);
        console.log(val);

    });
});
