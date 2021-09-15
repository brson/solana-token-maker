console.assert(solanaWeb3);
console.assert(splToken);

let web3 = solanaWeb3;

console.log(web3);
console.log(splToken);

const {
    Token
} = splToken;

console.log(Token);

let connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
);
