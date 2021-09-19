const anchor = require('@project-serum/anchor');

describe('blob', () => {

    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.Provider.local());

    it('Is initialized!', async () => {
        // Add your test here.
        const program = anchor.workspace.Blob;
        //const tx = await program.rpc.initialize();
        //console.log("Your transaction signature", tx);
    });
});
