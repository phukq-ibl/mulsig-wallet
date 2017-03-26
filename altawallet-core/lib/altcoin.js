var bitcoinjs = require("bitcoinjs-lib");
var networks = require('./networks.js');
var encrypt = require('./encrypt.js');
var Mnemonic = require('bitcore-mnemonic')
    /**
     * Constructor
     *
     * @param coinType - use AltCoin.CoinType
     */
function AltCoin(coinType) {
    this.coinType = coinType || AltCoin.CoinType.testnet;
    this.hdIndex = 0;
    this.PrivKeys = {};
    this.Addresses = [];
    this.hdPathString = AltCoin.HDPathString[coinType];
};

/**
 * Coin types
 */
AltCoin.CoinType = {
    bitcoin: "bitcoin",
    bitcoinTestnet: "bitcoinTestnet",

    litecoin: "litecoin",
    litecoinTestnet: "litecoinTestnet",

    dogecoin: "dogecoin",
    dogecoinTestnet: "dogecoinTestnet",

    dashcoin: "dashcoin",
    dashcoinTestnet: "dashcoinTestnet"

};

/**
 * The hd path strings
 * (See BIP44 specification for more info: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
 */
AltCoin.HDPathString = {
    bitcoin: "m/44'/0'/0'/0",
    litecoin: "m/44'/2'/0'/0",
    dogecoin: "m/44'/3'/0'/0",
    dashcoin: "m/44'/4'/0'/0",

    bitcoinTestnet: "m/44'/1'/0'/0",
    litecoinTestnet: "m/44'/3'/0'/0",
    dogecoinTestnet: "m/44'/5'/0'/0",
    dashcoinTestnet: "m/44'/7'/0'/0"
};

/**
 * Value used for fee estimation
 */
AltCoin.FeePerKb = {
    bitcoin: 50000, // satoshis per kilobyte
    bitcoinTestnet: 50000, // satoshis per kilobyte

    litecoin: 100000,
    litecoinTestnet: 100000,

    dogecoin: 1,
    dogecoinTestnet: 1,

    dashcoin: 1,
    dashcoinTestnet: 1
};

/**
 * Check hd path string
 */
AltCoin.prototype._checkHDPathString = function(hdPathString) {
    var path = hdPathString.split("/");

    if (path.length < 2 || path[0] != "m") {
        throw new Error("AltCoin._checkHDPathString: hdPathString is invalid");
    }
    for (var i = 1; i < path.length; i++) {
        if (isNaN(path[i].replace(/'/g, ""))) {
            throw new Error("AltCoin._checkHDPathString: hdPathString is invalid");
        }
    }

    return path.slice(1);
};

/**
 * Generate addresses
 */
AltCoin.prototype.generateAddresses = function(mnemonic, deriveKey, n) {
    var mnemonic = new Mnemonic(mnemonic);
    var seed = mnemonic.toSeed();

    var hdNode = bitcoinjs.HDNode.fromSeedBuffer(seed, networks[this.coinType]);
    var path = this._checkHDPathString(this.hdPathString);

    for (var i = 0; i < path.length; i++) {
        if (path[i].indexOf("'") == -1) {
            hdNode = hdNode.derive(parseInt(path[i]));

        } else {
            hdNode = hdNode.deriveHardened(parseInt(path[i].replace(/'/g, "")));
        }
    }

    for (var i = 0; i < n; i++) {
        var node = hdNode.derive(this.hdIndex++);
        var address = node.keyPair.getAddress()
        this.PrivKeys[address] = encrypt.encryptString(node.keyPair.toWIF(), deriveKey);
        this.Addresses.push(address);
    }
};

/**
 * Export private key
 */
AltCoin.prototype.exportPrivateKey = function(address) {
    if (this.PrivKeys[address] === undefined) {
        throw new Error("AltCoin.exportPrivateKey: Address not found");
    }
    return this.PrivKeys[address];
};

/**
 * Get an address
 */
AltCoin.prototype.getAddress = function(n) {
    return this.Addresses[n];
};

/**
 * Get addresses
 */
AltCoin.prototype.getAddresses = function() {
    return this.Addresses;
};

/**
 * Get private key
 * @returns {Array}
 */
AltCoin.prototype.getPrivKeys = function() {
    return this.PrivKeys;
};

/**
 * Set addresses
 */
AltCoin.prototype.setAddresses = function(address) {
    return this.Addresses = address;
};

/**
 * Set private key
 * @returns {Array}
 */
AltCoin.prototype.setPrivKeys = function(privKeys) {
    return this.PrivKeys = privKeys;
};

/**
 * Create transaction
 */
AltCoin.prototype.createRawTransaction = function(txParams) {
    var sender = txParams.from,
        receiver = txParams.to,
        amount = txParams.value,
        listUnspent = txParams.listUnspent;
    amount = AltCoin.convertToSatoshi(amount);


    var network = networks[this.coinType];
    var privateKey = this.exportPrivateKey(sender);
    privateKey = encrypt.decryptString(privateKey, txParams.derivedKey);

    var keyPair = bitcoinjs.ECPair.fromWIF(privateKey, network);
    var transaction = new bitcoinjs.TransactionBuilder(network);
    var total = 0;
    var output = [];
    var transaction_fee = 0;

    for (var i = 0; i < listUnspent.length; i++) {
        var unspent = listUnspent[i];
        total += AltCoin.convertToSatoshi(unspent.value);
        output.push(unspent);

        //if (total >= amount) {
        //	break;
        //}
        transaction_fee = this._calulateTransactionFee(output);
        if (total >= (amount + transaction_fee)) {
            break;
        }
    }

    var change = total - amount - transaction_fee;
    if (change < 0) {
        return {
            tx_hex: '',
            fee: transaction_fee,
            error: 'balance_not_enough'
        };
    }
    //var transaction_size = (output.length * 180) + (2 * 34) + 10 + output.length;
    //var transaction_fee = AltCoin.FeePerKb[this.coinType] * Math.ceil(transaction_size / 1000);
    //if (transaction_fee >= amount) {
    //   return {
    //       tx_hex : '',
    //       fee : 0,
    //       error: 'amount_too_small'
    //   };
    //}

    for (var i = 0; i < output.length; i++) {
        transaction.addInput(output[i].txid, output[i].output_no);
    }

    if (change > 0) {
        transaction.addOutput(sender, change);
    }

    transaction.addOutput(receiver, amount);

    for (var i = 0; i < output.length; i++) {
        transaction.sign(i, keyPair);
    }
    // console.log(total)
    // console.log(amount)
    // console.log(transaction_fee)
    return {
        tx_hex: transaction.build().toHex(),
        fee: transaction_fee,
        output: output
    };

};

AltCoin.prototype._calulateTransactionFee = function(output) {
    var transaction_size = (output.length * 180) + (2 * 34) + 10 + output.length;
    var transaction_fee = AltCoin.FeePerKb[this.coinType] * Math.ceil(transaction_size / 1000);
    return transaction_fee;
}

/**
 * Create transaction without sign
 */
AltCoin.prototype.createTransactionWithoutSign = function(sender, receiver, amount, listUnspent) {
    amount = AltCoin.convertToSatoshi(amount);

    var network = networks[this.coinType];
    var transaction = new bitcoinjs.TransactionBuilder(network);
    var total = 0;
    var output = [];

    for (var i = 0; i < listUnspent.length; i++) {
        var unspent = listUnspent[i];
        total += AltCoin.convertToSatoshi(unspent.value);
        output.push(unspent);

        if (total >= amount) {
            break;
        }
    }

    if (total < amount) {
        return {
            tx_hex: "",
            fee: 0
        };
    }

    var change = total - amount;
    var transaction_size = (output.length * 180) + (2 * 34) + 10 + output.length;
    var transaction_fee = AltCoin.FeePerKb[this.coinType] * Math.ceil(transaction_size / 1000);

    if (transaction_fee >= amount) {
        return {
            tx_hex: "",
            fee: 0
        };
    }

    for (var i = 0; i < output.length; i++) {
        transaction.addInput(output[i].txid, output[i].output_no);
    }

    if (change > 0) {
        transaction.addOutput(sender, change);
    }
    transaction.addOutput(receiver, amount - transaction_fee);

    return {
        tx_hex: transaction.tx.toHex(),
        output_number: output.length,
        fee: transaction_fee
    };
};

/**
 * Sign transaction
 */
AltCoin.prototype.signTransaction = function(privkey, tx_hex, output_number) {
    var network = networks[this.coinType];
    var keyPair = bitcoinjs.ECPair.fromWIF(privkey, network);
    var transaction = bitcoinjs.TransactionBuilder.fromTransaction(bitcoinjs.Transaction.fromHex(tx_hex), network);

    for (var i = 0; i < output_number; i++) {
        transaction.sign(i, keyPair);
    }

    return transaction.build().toHex();
};

/**
 * Convert to satoshi
 */
AltCoin.convertToSatoshi = function(amount) {
    return Math.floor(amount * 100000000);
};

module.exports = AltCoin;
