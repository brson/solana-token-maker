console.assert(solanaWeb3);
console.assert(splToken);

const web3 = solanaWeb3;

// For console testing
document.web3 = web3;
document.splToken = splToken;

const {
    Token
} = splToken;

const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
);

const walletPrivkeyInput = document.getElementById("wallet-privkey");
const walletPubkeySpan = document.getElementById("wallet-pubkey");
const walletLamportsSpan = document.getElementById("wallet-lamports");

console.assert(walletPrivkeyInput);
console.assert(walletPubkeySpan);
console.assert(walletLamportsSpan);

// https://www.thetopsites.net/article/50868276.shtml
const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

let keypair = new web3.Keypair();

let secretKeyHex = toHexString(keypair.secretKey);
let publicKeyHex = keypair.publicKey.toString();

walletPrivkeyInput.value = secretKeyHex;
walletPubkeySpan.innerText = publicKeyHex;

walletPrivkeyInput.addEventListener("input", (e) => {
    walletPubkeySpan.innerText = "";
    let maybePrivKey = walletPrivkeyInput.value;

    // todo
});

