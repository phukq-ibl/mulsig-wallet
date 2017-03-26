module.exports = {
    networks: require('./lib/networks.js'),
    encrypt: require('./lib/encrypt.js'),
    altcoin: require('./lib/altcoin.js'),
    ethereum: require('./lib/ethereum.js'),
    wallet: require('./lib/wallet.js'),
    CryptoJS: require('crypto-js'),
    EthereumjsAbi: require('ethereumjs-abi'),
    EthereumjsTx: require('ethereumjs-tx'),
    EthereumjsUtils: require('ethereumjs-util')
};
