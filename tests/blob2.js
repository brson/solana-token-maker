const anchor = require('@project-serum/anchor');
const assert = require("assert");

describe('blob2', () => {

    // Configure the client to use the local cluster.
    const provider = anchor.Provider.local();
    anchor.setProvider(provider);

    it('Is initialized!', async () => {
        // Add your test here.
        const blob = anchor.workspace.Blob2;

        const payer = anchor.web3.Keypair.generate();

        await provider.connection.requestAirdrop(payer.publicKey, 1000000);

        const key = "foo";
        const storageReference = await anchor.web3.PublicKey.createWithSeed(
            payer.publicKey,
            "foo",
            blob.programId
        );

        const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                "init"
            ],
            blob.programId
        );

        console.log(blob);

        await blob.rpc.init({
            accounts: {
                payer: payer.publicKey,
                storageReference: storageReference,
                initialStorage: initialStorage,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [
                payer,
            ],
        });

    });
});
