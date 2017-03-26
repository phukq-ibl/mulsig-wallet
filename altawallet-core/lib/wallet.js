var AltCoin = require('./altcoin.js'),
    Ethereum = require('./ethereum.js'),
    Mnemonic = require('bitcore-mnemonic'),
    Encrypt = require('./encrypt.js'),
    CryptoJS = require('crypto-js'),
    ABI = require('ethereumjs-abi');

var Wallet = function() {
    this.coinNames = '';
    this.libs = {};
    this.mnemonic = '';
};

Wallet.createInstance = function(mnemonic, password, coinNames, callback) {
    var wallet = new Wallet();
    var libs = {};

    Encrypt.deriveKeyFromPassword(password, function(err, derivedKey) {
        wallet.setLibs(libs);
        var encryptMnemonic = Encrypt.encryptString(mnemonic, derivedKey);
        wallet.setMnemonic(encryptMnemonic);
        wallet.setCoinNames(coinNames);
        for (var i = 0; i < coinNames.length; i++) {
            if (coinNames[i] == 'ethereum' || coinNames[i] == 'ethereumTestnet') {
                libs[coinNames[i]] = new Ethereum();
            } else {
                libs[coinNames[i]] = new AltCoin(coinNames[i]);
            }

            libs[coinNames[i]].generateAddresses(mnemonic, derivedKey, 10)
        }

        callback(wallet);
    });

}

Wallet.prototype.setLibs = function(libs) {
    this.libs = libs;
}

Wallet.prototype.setCoinNames = function(coinNames) {
    this.coinNames = coinNames;
}

Wallet.prototype.getCoinNames = function(coinNames) {
    return this.coinNames
}

Wallet.prototype.setMnemonic = function(mnemonic) {
    this.mnemonic = mnemonic;
}

Wallet.prototype.getMnemonic = function(mnemonic) {
        return this.mnemonic;
    }
    /**
     * Mnemonic language
     */
Wallet.Mnemonic = {
    English: Mnemonic.Words.ENGLISH,
    Japanese: Mnemonic.Words.JAPANESE
};

/**
 * Generate random mnemonic
 * (See BIP39 specification for more info: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
 *
 * @param ent - entropy length (128 | 160 | 192 | 224 | 256)
 * @param wordlist - use Wallet.Mnemonic
 */
Wallet.generateMnemonic = function() {
    var mnemonic = new Mnemonic(128, Wallet.Mnemonic.English);
    return mnemonic.toString();
};

/**
 * Will return a boolean if the mnemonic is valid
 *
 * @param mnemonic - the mnemonic string
 * @param wordlist - use Wallet.Mnemonic
 */
Wallet.isValidMnemonic = function(mnemonic, wordlist) {
    return Mnemonic.isValid(mnemonic, wordlist);
};

/**
 * Will generate a seed based on the mnemonic and optional passphrase.
 */
Wallet.generateSeed = function(mnemonic, passphrase) {
    var mnemonic = new Mnemonic(mnemonic);
    return mnemonic.toSeed(passphrase);
};

Wallet.prototype.generateAddresses = function(mnemnonic, password, callback) {
    var me = this;
    Encrypt.deriveKeyFromPassword(password, function(err, derivedKey) {
        for (var i = 0; i < me.coinNames.length; i++) {
            me.libs[me.coinNames[i]].generateAddresses(mnemnonic, derivedKey, 10);
        }

        callback(me);
    });
}

Wallet.prototype.getFirstAddress = function(coinName) {
    return this.getAddress(coinName, 0);
}

Wallet.prototype.getAddress = function(coinName, n) {
    if (this.libs[coinName].getAddresses().length == 0) {
        this.libs[coinName].generateAddress();
    }
    return this.libs[coinName].getAddresses()[n];
}

Wallet.prototype.exportPrivateKey = function(coinName, address) {
    return this.libs[coinName].exportPrivateKey(address);
}

/**
 *
 * @param coinName Name of coin
 * @param txParams transaction parameter
 *          {
 *              from: address
 *              to: address
 *              value: amount money to send,
 *              [nonce: Ethereum nonce],
 *              [listUnspent: bitcoin unspent output]
 *          }
 * @param password
 * @returns {*}
 */
Wallet.prototype.createRawTransaction = function(coinName, txParams, password, callback) {
    var privateKey = this.exportPrivateKey(coinName, txParams.from);
    var me = this;
    Encrypt.deriveKeyFromPassword(password, function(err, derivedKey) {
        txParams.derivedKey = derivedKey;
        callback(me.libs[coinName].createRawTransaction(txParams));
    })
}

Wallet.encryptString = function(string, password, callback) {
    Encrypt.deriveKeyFromPassword(password, function(err, deriveKey) {
        var data = Encrypt.encryptString(string, deriveKey);
        callback(data);
    });
}

Wallet.decryptString = function(string, password, callback) {
    Encrypt.deriveKeyFromPassword(password, function(err, deriveKey) {
        var data = Encrypt.decryptString(string, deriveKey);
        callback(data);
    });
}

Wallet.decrypt = function(string, deriveKey) {
    var data = Encrypt.decryptString(string, deriveKey);
    return data;
}

Wallet.encrypt = function(string, deriveKey, calback) {
    var data = Encrypt.encryptString(string, deriveKey);
    return data;
}

Wallet.deriveKeyFromPassword = function(password, callback) {
    Encrypt.deriveKeyFromPassword(password, function(err, deriveKey) {
        callback(err, deriveKey);
    });
}

Wallet.prototype.serialize = function() {
    var json = {};
    json.mnemonic = this.mnemonic;
    json.coinNames = this.coinNames;
    for (var i = 0; i < this.coinNames.length; i++) {
        json[this.coinNames[i]] = {
            PrivKeys: this.libs[this.coinNames[i]].getPrivKeys(),
            Addresses: this.libs[this.coinNames[i]].getAddresses()
        }
    }
    return json;
}

Wallet.prototype.deserialize = function(json) {
    this.libs = {};
    if (json == null || typeof json.mnemonic == 'undefined')
        return null;
    this.mnemonic = json.mnemonic;
    this.coinNames = json.coinNames;
    for (var i = 0; i < json.coinNames.length; i++) {
        if (this.coinNames[i] == 'ethereum' || this.coinNames[i] == 'ethereumTestnet') {
            var lib = new Ethereum();
            lib.setAddresses(json[json.coinNames[i]].Addresses);
            lib.setPrivKeys(json[json.coinNames[i]].PrivKeys);
        } else {
            var lib = new AltCoin(json.coinNames[i]);
            lib.setAddresses(json[json.coinNames[i]].Addresses);
            lib.setPrivKeys(json[json.coinNames[i]].PrivKeys);
        }
        this.libs[json.coinNames[i]] = lib;
    }
}

Wallet.prototype.changePassword = function(currentPassword, newPassword, confirmPassword, callback) {
    var me = this;
    if (newPassword != confirmPassword) {
        return callback('not_match', null);
    }
    var address = this.getFirstAddress(this.coinNames[0]);
    var privateKey = this.exportPrivateKey(this.coinNames[0], address);

    Encrypt.deriveKeyFromPassword(currentPassword, function(err, derivedKey) {
        var checkPrivateKey = Encrypt.decryptString(privateKey, derivedKey);
        if (checkPrivateKey == '') {
            return callback('wrong_password', null);
        }

        var mnemonic = Encrypt.decryptString(me.mnemonic, derivedKey);

        Wallet.createInstance(mnemonic, newPassword, me.coinNames, function(wallet) {
            me = wallet;
            callback(null, me);
        });
    });
}

/**
 * Get the id of function by function mask
 */
Wallet.createFunctionId = function(fMask){
    var hash = CryptoJS.SHA3(fMask, {outputLength: 256});
    return hash.toString().substr(0, 8);
}

/**
 * Create data for smartcontract
 * This function has many arguments
 * The first is function mask example: "transfer(address,value)"
 * The others are parameter of function mask
 */
Wallet.createContractData = function(){
    var args = Array.from(arguments);
    return ABI.simpleEncode.apply(null, args);
}

module.exports = Wallet;
