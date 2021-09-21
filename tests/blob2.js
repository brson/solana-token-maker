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

        const [ storageReference, storageReferenceBumpSeed ] = await anchor.web3.PublicKey.findProgramAddress(
            [
                "key",
                payer.publicKey.toBuffer(),
                "foo",
            ],
            blob.programId
        );

        const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                "init",
                storageReference.toBuffer()
            ],
            blob.programId
        );

        await blob.rpc.init(Buffer.from("foo"), storageReferenceBumpSeed, {
            accounts: {
                payer: payer.publicKey,
                storageReference: storageReference,
                initialStorage: initialStorage,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [
                payer
            ],
        });

        let storageReferenceValue = await blob.account.storageReference.fetch(storageReference);
        let storage = storageReferenceValue.storage;

        let storageAccountInfo = await provider.connection.getAccountInfo(storage);
        let data = storageAccountInfo.data

        assert.ok(data.length == 1);
        assert.ok(data[0] == 0);


        const [ nextStorage, nextStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                "next",
                initialStorage.toBuffer()
            ],
            blob.programId
        );

        await blob.rpc.set(Buffer.from("bar"), {
            accounts: {
                payer: payer.publicKey,
                storageReference: storageReference,
                storage: initialStorage,
                nextStorage: nextStorage,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [
                payer
            ],
        });


    });
});
