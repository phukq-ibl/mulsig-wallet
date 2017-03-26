var bitcore = require("bitcore-lib");
var Mnemonic = require("bitcore-mnemonic");
var EC = require("elliptic").ec;
var ec = new EC("secp256k1");
var CryptoJS = require("crypto-js");
var Transaction = require("ethereumjs-tx");
var Encrypt = require('./encrypt.js');

/**
 * Constructor
 */
var Ethereum = function () {
    this.hdIndex = 0;
    this.PrivKeys = {};
    this.Addresses = [];
};

/**
 * The hd path string
 * (See BIP44 specification for more info: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
 */
Ethereum.HDPathString = "m/44'/60'/0'/0";

Ethereum.Gas = 21000;
Ethereum.GasPrice = 20000000000;
Ethereum.convertToWei = function (ether) {
    var wei = Math.floor(ether * 1000000000000000000);
    return wei;
}
/**
 * Generate private key
 */
Ethereum.prototype._generatePrivKeys = function (mnemonic, n) {
    var hdRoot = new bitcore.HDPrivateKey(new Mnemonic(mnemonic).toHDPrivateKey().xprivkey);
    var hdPath = hdRoot.derive(Ethereum.HDPathString).xprivkey;
    var keys = [];

    for (var i = 0; i < n; i++) {
        var key = new bitcore.HDPrivateKey(hdPath).derive(this.hdIndex++);
        keys[i] = key.privateKey.toString();
    }

    return keys;
};

/**
 * Compute address from private key
 */
Ethereum._computeAddressFromPrivKey = function (privKey) {
    var keyPair = ec.genKeyPair();
    keyPair._importPrivate(privKey, "hex");
    var compact = false;
    var pubKey = keyPair.getPublic(compact, "hex").slice(2);
    var pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
    var hash = CryptoJS.SHA3(pubKeyWordArray, {
        outputLength: 256
    });
    return hash.toString(CryptoJS.enc.Hex).slice(24);
};

/**
 * Generate addresses
 */
Ethereum.prototype.generateAddresses = function (mnemonic, deriveKey, n) {
    n = n || 1;
    var keys = this._generatePrivKeys(mnemonic, n, Ethereum.HDPathString);

    for (var i = 0; i < n; i++) {
        var address = "0x" + Ethereum._computeAddressFromPrivKey(keys[i]);
        this.PrivKeys[address] = Encrypt.encryptString(keys[i], deriveKey);
        this.Addresses.push(address);
    }
};

Ethereum.prototype.importPrivate = function (privateKey, deriveKey) {
    var address = "0x" + Ethereum._computeAddressFromPrivKey(privateKey);
    this.PrivKeys[address] = Encrypt.encryptString(privateKey, deriveKey);
    this.Addresses.push(address);
}

/**
 * Get an address
 */
Ethereum.prototype.getAddresses = function (n) {
    return this.Addresses[n];
};

/**
 * Get addresses
 */
Ethereum.prototype.getAddresses = function () {
    return this.Addresses;
};

/**
 * Get private keys
 * @returns {Array}
 */
Ethereum.prototype.getPrivKeys = function () {
    return this.PrivKeys;
};

/**
 * Set addresses
 */
Ethereum.prototype.setAddresses = function (address) {
    return this.Addresses = address;
};

/**
 * Set private key
 * @returns {Array}
 */
Ethereum.prototype.setPrivKeys = function (privKeys) {
    return this.PrivKeys = privKeys;
};

/**
 * Export private key
 */
Ethereum.prototype.exportPrivateKey = function (address) {
    if (this.PrivKeys[address] === undefined) {
        throw new Error("Ethereum.exportPrivateKey: Address not found.");
    }
    return this.PrivKeys[address];
};

/**
 * Create transaction
 *
 * @example
 *	var txParams = {
 *		from: "0x9c729ef4cec1b1bdffaa281c2ff76b48fdcb874c",
 *		to: "0xfd2921b8b8f0dccf65d4b0793c3a2e5c127f3e86",
 *		value: 12,
 *		nonce: 1
 *	};
 */
Ethereum.prototype.createRawTransaction = function (txParams) {
    // Convert value from ether to wei
    txParams.value = Ethereum.convertToWei(txParams.value);

    if (!txParams.gas) {
        txParams.gas = Ethereum.Gas;
    }

    // Calculate transaction fee
    var transaction_fee = txParams.gas * Ethereum.GasPrice;

    var transaction = new Transaction();

    transaction.from = txParams.from;
    transaction.to = txParams.to;
    transaction.gasLimit = txParams.gas;
    transaction.gasPrice = Ethereum.GasPrice;
    transaction.nonce = txParams.nonce;
    transaction.value = txParams.value;
    transaction.data = txParams.data;

    var privateKey = this.exportPrivateKey(txParams.from);
    privateKey = Encrypt.decryptString(privateKey, txParams.derivedKey);
    privateKey = new Buffer(privateKey, 'hex')

    transaction.sign(new Buffer(privateKey), "hex");
    return {
        tx_hex: transaction.serialize().toString("hex"),
        fee: transaction_fee
    };
};

/**
 * Create transaction without sign
 *
 * @example
 *	var txParams = {
 *		from: "0x9c729ef4cec1b1bdffaa281c2ff76b48fdcb874c",
 *		to: "0xfd2921b8b8f0dccf65d4b0793c3a2e5c127f3e86",
 *		value: 0,
 *		nonce: 1
 *	};
 */
Ethereum.createTransactionWithoutSign = function (txParams) {
    if (!txParams.gas) {
        txParams.gas = Ethereum.Gas;
    }
    var transaction_fee = Ethereum.Gas * Ethereum.GasPrice;
    
    var transaction = new Transaction();

    transaction.from = txParams.from;
    transaction.to = txParams.to;
    transaction.gasLimit = txParams.gas;
    transaction.gasPrice = Ethereum.GasPrice;
    transaction.nonce = txParams.nonce;
    transaction.value = txParams.value; // - transaction_fee;
    transaction.data = txParams.data;

    return {
        tx_hex: transaction.serialize().toString("hex"),
        fee: transaction_fee
    };
};

/**
 * Sign transaction
 */
Ethereum.signTransaction = function (privkey, tx_hex) {
    var transaction = new Transaction(new Buffer(tx_hex, "hex"));
    transaction.sign(new Buffer(privkey, "hex"));
    return transaction.serialize().toString("hex");
};

module.exports = Ethereum;
