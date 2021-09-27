console.assert(nodeBundle);

const web3 = nodeBundle.web3;
const anchor = nodeBundle.anchor;
const Buffer = nodeBundle.buffer.Buffer;

const blob2Idl = await fetch("../target/idl/blob2.json").then(r => r.json());
const blob2PrgramIdDevnet = "J6h7RJ9EwLxvEYLqDDvtF1S8GxijChuy5zRKy1NNpU1P";

export async function create(anchorProvider) {
    const blob2 = new anchor.Program(blob2Idl, blob2PrgramIdDevnet, anchorProvider);
    return blob2;
}

export async function readKeyJson(blob2, payer, base, key) {
    let value = await readKeyString(blob2, payer, base, key);
    if (value != null) {
        return JSON.parse(value);
    } else {
        return null;
    }
}

export async function writeKeyJson(blob2, payer, base, key, value) {
    return writeKeyString(blob2, payer, base, key, JSON.stringify(value));
}

export async function readKeyString(blob2, payer, base, key) {
    let bytes = await readKeyBytes(blob2, payer, base, key);
    if (bytes != null) {
        return anchor.utils.bytes.utf8.decode(bytes);
    } else {
        return null;
    }
}

export async function writeKeyString(blob2, payer, base, key, value) {
    return await writeKeyBytes(blob2, payer, base, key, Buffer.from(value));
}

export async function readKeyBytes(blob2, payer, base, key) {
    let provider = blob2.provider;
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(blob2, base, key);

    let storage = await getStorage(blob2, storageReference);

    return storage;
}

export async function writeKeyBytes(blob2, payer, base, key, value) {
    let provider = blob2.provider;
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(blob2, base, key);

    {
        let storageReferenceAccountInfo = await provider.connection.getAccountInfo(storageReference);

        if (storageReferenceAccountInfo == null) {
            await initStorage(blob2, payer, base, key);
        }
    }

    let storageReferenceValue = await blob2.account.storageReference.fetch(storageReference);
    let storage = storageReferenceValue.storage;
    
    const [ nextStorage, nextStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
        [
            "next",
            storage.toBuffer()
        ],
        blob2.programId
    );

    console.assert(typeof value != "string");

    await blob2.rpc.set(value, {
        accounts: {
            payer: payer.publicKey,
            storageReference: storageReference,
            storage: storage,
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
    const [ storageReference, storageReferenceBumpSeed ] = await storageReferenceForKey(blob2, base, key);

    const [ initialStorage, initialStorageBumpSeed ]  = await anchor.web3.PublicKey.findProgramAddress(
        [
            "init",
            storageReference.toBuffer()
        ],
        blob2.programId
    );

    console.log(payer);
    await blob2.rpc.init(Buffer.from(key), storageReferenceBumpSeed, {
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
        if (storageReferenceAccountInfo == null) {
            return null;
        }
    }

    let storageReferenceValue = await blob2.account.storageReference.fetch(storageReference);
    let storage = storageReferenceValue.storage;

    let storageAccountInfo = await provider.connection.getAccountInfo(storage);
    let storageData = storageAccountInfo.data;

    let header = storageData[0];
    let payload = storageData.slice(1);
    if (header == 0) {
        return null;
    } else {
        return payload;
    }
}

async function storageReferenceForKey(blob2, base, key) {
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
