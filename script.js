console.assert(solanaWeb3);
console.assert(splToken);

const web3 = solanaWeb3;

// For console testing
document.web3 = web3;
document.splToken = splToken;

const {
    LAMPORTS_PER_SOL
} = web3;

const {
    Token
} = splToken;

const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
);





const walletPrivkeyInput = document.getElementById("wallet-privkey");
const walletPubkeySpan = document.getElementById("wallet-pubkey");
const walletBalanceSpan = document.getElementById("wallet-balance");
const walletNewPrivkeyButton = document.getElementById("wallet-new-privkey");
const requestAirdropButton = document.getElementById("request-airdrop");

console.assert(walletPrivkeyInput);
console.assert(walletPubkeySpan);
console.assert(walletBalanceSpan);
console.assert(requestAirdropButton);





// https://www.thetopsites.net/article/50868276.shtml
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');





let keypair = null;





function getCookieValue(name) {
    if (document.cookie.includes(`${name}=`) == false) {
        return null;
    }

    // https://developer.mozilla.org/en-US/docs/web/api/document/cookie
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        .split('=')[1];
}

function setWalletSecretKeyCookie(keypair) {
    let hex = toHexString(keypair.secretKey);
    document.cookie = `walletSecretKey=${hex}`;
}

function getWalletSecretKeyCookie() {
    let keyHex = getCookieValue("walletSecretKey");

    if (keyHex == null) {
        return null;
    }

    return keypairFromHex(keyHex);
}

function keypairFromHex(secretKey) {
    let secretKeyBin = fromHexString(secretKey);

    try {
        return web3.Keypair.fromSecretKey(secretKeyBin);
    } catch {
        return null;
    }
}

async function trySetKeypair(secretKeyHex) {
    keypair = null;
    walletPubkeySpan.innerText = "";
    walletBalanceSpan.innerText = "";

    // fromHexString can't handle empty strings
    if (secretKeyHex == "") {
        return;
    }

    keypair = keypairFromHex(secretKeyHex);

    if (keypair == null) {
        return;
    }

    setWalletSecretKeyCookie(keypair);

    let publicKeyHex = keypair.publicKey.toString();

    walletPrivkeyInput.value = secretKeyHex;
    walletPubkeySpan.innerText = publicKeyHex;

    await loadAndRenderBalance();
}

async function loadAndRenderBalance() {
    if (keypair == null) {
        return;
    }

    let balance = await connection.getBalance(keypair.publicKey);
    walletBalanceSpan.innerText = balance;
}

async function setRandomKeypair() {
    let keypair = new web3.Keypair();
    let secretKeyHex = toHexString(keypair.secretKey);
    await trySetKeypair(secretKeyHex);
}

async function setInitialKeypair() {
    let keypair = getWalletSecretKeyCookie();

    if (keypair == null) {
        keypair = new web3.Keypair();
    } else {
        let secretKeyHex = toHexString(keypair.secretKey);
        await trySetKeypair(secretKeyHex);
    }
}




await setInitialKeypair();

walletPrivkeyInput.addEventListener("input", async (e) => {
    let maybePrivKey = walletPrivkeyInput.value;
    await trySetKeypair(maybePrivKey);
});

walletNewPrivkeyButton.addEventListener("click", async () => {
    await setRandomKeypair();
});

requestAirdropButton.addEventListener("click", async () => {
    if (keypair == null) {
        return;
    }

    let txSig = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txSig);

    loadAndRenderBalance();
});
