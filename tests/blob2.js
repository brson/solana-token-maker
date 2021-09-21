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

        let airtx = await provider.connection.requestAirdrop(payer.publicKey, anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(airtx);

        console.log(anchor.web3.LAMPORTS_PER_SOL);

        let balance = await provider.connection.getBalance(payer.publicKey);

        console.log(`balance ${balance}`);

        const storageReference = await anchor.web3.PublicKey.createWithSeed(
            payer.publicKey,
            "foo",
            blob.programId
        );

        let rent = await provider.connection.getMinimumBalanceForRentExemption(8 + 32);

        console.log(`rent ${rent}`);

        console.log("a");
        let tx = new anchor.web3.Transaction();
        tx.add(anchor.web3.SystemProgram.createAccountWithSeed({
            basePubkey: payer.publicKey,
            fromPubkey: payer.publicKey,
            lamports: rent,
            newAccountPubkey: storageReference,
            programId: blob.programId,
            seed: "foo",
            space: 8 + 32
        }));
        console.log("b");

        await provider.send(tx, [payer]);
        console.log("c");

        const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
            [
                "init",
                storageReference.toBuffer()
            ],
            blob.programId
        );

        //console.log(blob);

        //let instr = await blob.account.storageReference.createInstruction(payer);
        //console.log(instr);
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
        });

        let val = await blob.account.storageReference.fetch(storageReference);
        console.log(val);

    });
});
