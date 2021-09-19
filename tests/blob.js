const anchor = require('@project-serum/anchor');

describe('blob', () => {

    // Configure the client to use the local cluster.
    const provider = anchor.Provider.local();
    anchor.setProvider(provider);

    it('Is initialized!', async () => {
        // Add your test here.
        const blob = anchor.workspace.Blob;

        const payer = anchor.web3.Keypair.generate();

        await provider.connection.requestAirdrop(payer.publicKey, 1000000);

        const key = "foo";
        const base = payer;
        const storage = await anchor.web3.PublicKey.createWithSeed(base.publicKey, key, blob.programId);

        await blob.rpc.set(
            base.publicKey, key, Buffer.from("bobb"), new anchor.BN(10000),
            {
                accounts: {
                    payer: payer.publicKey,
                    base: base.publicKey,
                    storage: storage,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [
                    payer,
                    base
                ],
            }
        );
    });
});
