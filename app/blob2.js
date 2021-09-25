console.assert(nodeBundle);

const web3 = nodeBundle.web3;
const anchor = nodeBundle.anchor;

const blob2Idl = await fetch("../target/idl/blob2.json").then(r => r.json());
const blob2PrgramIdDevnet = "J6h7RJ9EwLxvEYLqDDvtF1S8GxijChuy5zRKy1NNpU1P";

async function create(anchorProvider) {
    const blob2 = new anchor.Program(blob2Idl, blob2PrgramIdDevnet, anchorProvider);
    return blob2;
}

async function readKeyJson(blob2, payer, base, key) {
}

async function writeKeyJson(blob2, payer, base, key, value) {
}

async function readKey(blob2, payer, base, key) {
    let provider = blob2.provider;
    const [ tokensStorageReference, tokensStorageReferenceBumpSeed ] = await tokensStorageReference();

    let storage = await getStorage(anchorProvider, blob2, tokensStorageReference);
}

async function writeKey(blob2, payer, base, key, value) {
}

async function getStorage(blob2, storageReference) {
    let provider = blob2.provider;
    let storageReferenceValue = await blob2.account.storageReference.fetch(storageReference);
    let storage = storageReferenceValue.storage;

    let storageAccountInfo = await provider.connection.getAccountInfo(storage);
    let data = storageAccountInfo.data;

    assert.ok(data.length > 0);
    let header = data[0];
    let payload = data.slice(1);
    if (header == 0) {
        return null;
    } else {
        return payload;
    }
}

async function tokensStorageReference(base) {
    const [ tokensStorageReference, tokensStorageReferenceBumpSeed ] = await anchor.web3.PublicKey.findProgramAddress(
        [
            "key",
            base.publicKey.toBuffer(),
            "tokens",
        ],
        blob2.programId
    );

    return [ tokensStorageReference, tokensStorageReferenceBumpSeed ];
}
