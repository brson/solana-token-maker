const anchor = require('@project-serum/anchor');
const assert = require("assert");

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
        const [ storage, storage_bump_seed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                base.publicKey.toBuffer(),
                anchor.utils.bytes.utf8.encode(key)
            ],
            blob.programId
        );

        await blob.rpc.set(
            key, Buffer.from("bob"), new anchor.BN(10000),
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

        /*let valueBytes = await blob.rpc.get(
            key,
            {
                accounts: {
                    base: base.publicKey,
                    storage: storage
                },
            }
        );
        */
        let account = await provider.connection.getAccountInfo(storage);
        let initByte = account.data[0];
        assert.ok(initByte == 0xAE);
        let valueBytes = account.data.slice(1);
        let value = anchor.utils.bytes.utf8.decode(Buffer.from(valueBytes));

        assert.ok(value == "bob");
    });
});
