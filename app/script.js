console.assert(nodeBundle);

const web3 = nodeBundle.web3;
const splToken = nodeBundle.splToken;
const anchor = nodeBundle.anchor;

// For console testing
document.web3 = web3;
document.splToken = splToken;
document.anchor = anchor;

const {
    LAMPORTS_PER_SOL
} = web3;

const {
    Token,
    TOKEN_PROGRAM_ID
} = splToken;

import * as dom from "./dom.js";
import * as blob2 from "./blob2.js";





let keypair = null;
let lastKeypair = null;
let tokenMints = [];

const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
);

const anchorProvider = new anchor.Provider(connection);
const blob2Program = await blob2.create(anchorProvider);




// https://www.thetopsites.net/article/50868276.shtml
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

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
    if (keypair != null) {
        lastKeypair = keypair;
    }

    keypair = null;
    dom.walletPubkeySpan.innerText = "";
    dom.walletBalanceSpan.innerText = "";

    // fromHexString can't handle empty strings
    if (secretKeyHex == "") {
        return;
    }

    keypair = keypairFromHex(secretKeyHex);

    if (keypair == null) {
        return;
    }

    setWalletSecretKeyCookie(keypair);

    let publicKeyString = keypair.publicKey.toString();

    dom.walletPrivkeyInput.value = secretKeyHex;
    dom.walletPubkeySpan.innerText = publicKeyString;

    await loadAndRenderBalance();
}

async function loadAndRenderBalance() {
    if (keypair == null) {
        return;
    }

    let balance = await connection.getBalance(keypair.publicKey);
    dom.walletBalanceSpan.innerText = balance;
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

function initAdvancedDrawers() {
    let headers = document.querySelectorAll("div.advanced > h3");

    for (let header of headers) {
        let container = header.parentElement;
        header.addEventListener("click", () => {
            container.classList.toggle("visible");
        });
    }
}

async function loadTokens() {
    if (keypair == null) {
        return;
    }

    let tokenMints_ = await blob2.readKeyJson(blob2Program, keypair, keypair, "tokens");
    if (tokenMints_ != null) {
        tokenMints = tokenMints_;
    } else {
        tokenMints = [];
    }

    updateTokenMintsUi();
}

async function saveTokens() {
    if (keypair == null) {
        return;
    }

    await blob2.writeKeyJson(blob2Program, keypair, keypair, "tokens", tokenMints);

    updateTokenMintsUi();
}

function updateTokenMintsUi() {
    console.log("update token mints");
    console.log(tokenMints);
}





dom.walletPrivkeyInput.addEventListener("input", async (e) => {
    let maybePrivKey = dom.walletPrivkeyInput.value;
    await trySetKeypair(maybePrivKey);
});

dom.walletNewPrivkeyButton.addEventListener("click", async () => {
    await setRandomKeypair();
});

dom.walletNewPrivkeyOopsButton.addEventListener("click", async () => {
    if (lastKeypair == null) {
        return;
    }

    let lastHex = toHexString(lastKeypair.secretKey);
    await trySetKeypair(lastHex);
});

dom.requestAirdropButton.addEventListener("click", async () => {
    if (keypair == null) {
        return;
    }

    let txSig = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txSig);

    loadAndRenderBalance();
});




dom.createTokenButton.addEventListener("click", async () => {
    if (keypair == null) {
        return;
    }

    let payer = keypair;
    let mintAuthority = keypair.publicKey;
    let freezeAuthority = keypair.publicKey;
    let decimals = 9;
    let programId = null;

    let token = await Token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals,
        TOKEN_PROGRAM_ID
    );

    console.log(token);

    console.log(`token publicKey: ${token.publicKey.toString()}`);
    console.log(`token programId: ${token.programId.toString()}`);
    console.log(`token payer: ${token.payer.publicKey.toString()}`);

    tokenMints += [token.publicKey.toString()];

    await saveTokens();
    updateTokenMintsUi();
});





initAdvancedDrawers();
await setInitialKeypair();
await loadTokens();
