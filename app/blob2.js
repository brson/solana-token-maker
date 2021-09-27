console.assert(nodeBundle);

const web3 = nodeBundle.web3;
const anchor = nodeBundle.anchor;

const blob2Idl = await fetch("../target/idl/blob2.json").then(r => r.json());
const blob2PrgramIdDevnet = "J6h7RJ9EwLxvEYLqDDvtF1S8GxijChuy5zRKy1NNpU1P";

export async function create(anchorProvider) {
    const blob2 = new anchor.Program(blob2Idl, blob2PrgramIdDevnet, anchorProvider);
    return blob2;
}

export async function readKeyJson(blob2, payer, base, key) {
}

export async function writeKeyJson(blob2, payer, base, key, value) {
}

export async function readKeyString(blob2, payer, base, key) {
}

export async function writeKeyString(blob2, payer, base, key, value) {
}

export async function readKeyBytes(blob2, payer, base, key) {
    let provider = blob2.provider;
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(base, key);

    let storage = await getStorage(anchorProvider, blob2, storageReference);

    return storage;
}

export async function writeKeyBytes(blob2, payer, base, key, value) {
    let provider = blob2.provider;
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(base, key);

    {
        let storageReferenceAccountInfo = await provider.connection.getAccountInfo(storageReference);
        let storageReferenceData = storageReferenceAccountInfo.data;

        if (storageReferenceData.length == 0) {
            await initStorage(blob2, payer, base, key);
        }
    }

    let storageReferenceValue = await blob2.account.storageReference.fetch(storageReference);
    let storage = storageReferenceValue.storage;
    
    const [ nextStorage, nextStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
        [
            "next",
            initialStorage.toBuffer()
        ],
        blob.programId
    );

    console.assert(typeof value != "string");

    await blob.rpc.set(value, {
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
}

async function initStorage(blob2, payer, base, key) {
    let provider = blob2.provider;
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(base, key);

    const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
        [
            "init",
            storageReference.toBuffer()
        ],
        blob2.programId
    );
    
    await blob.rpc.init(Buffer.from(key), storageReferenceBumpSeed, {
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
}

async function getStorage(blob2, storageReference) {
    let provider = blob2.provider;

    {
        let storageReferenceAccountInfo = await provider.connection.getAccountInfo(storageReference);
        let storageReferenceData = storageReferenceAccountInfo.data;

        if (storageReferenceData.length == 0) {
            return null;
        }
    }

    let storageReferenceValue = await blob2.account.storageReference.fetch(storageReference);
    let storage = storageReferenceValue.storage;

    let storageAccountInfo = await provider.connection.getAccountInfo(storage);
    let storageData = storageAccountInfo.data;

    assert.ok(storageData.length > 0);
    let header = storageData[0];
    let payload = storageData.slice(1);
    if (header == 0) {
        return null;
    } else {
        return payload;
    }
}

async function storageReferenceForKey(base, key) {
    const [ storageReference, storageReferenceBumpSeed ] = await anchor.web3.PublicKey.findProgramAddress(
        [
            "key",
            base.publicKey.toBuffer(),
            key,
        ],
        blob2.programId
    );

    return [ storageReference, storageReferenceBumpSeed ];
}
