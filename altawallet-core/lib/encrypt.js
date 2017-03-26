var scrypt = require('scrypt-async');
var nacl = require('tweetnacl');
var naclUtil = require('tweetnacl-util')


var Encrypt = {};
Encrypt.encryptString = function(string, pwDerivedKey) {
    var nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    var encObj = nacl.secretbox(naclUtil.decodeUTF8(string), nonce, pwDerivedKey);
    var encString = {
        'encStr': naclUtil.encodeBase64(encObj),
        'nonce': naclUtil.encodeBase64(nonce)
    };
    return encString;
};

Encrypt.decryptString = function(encryptedStr, pwDerivedKey) {
    var secretbox = naclUtil.decodeBase64(encryptedStr.encStr);
    var nonce = naclUtil.decodeBase64(encryptedStr.nonce);
    var decryptedStr = nacl.secretbox.open(secretbox, nonce, pwDerivedKey);
    return naclUtil.encodeUTF8(decryptedStr);
};

Encrypt.deriveKeyFromPassword = function(password, callback) {
    var salt = 'cardanovietnam';
    var logN = 14;
    var r = 8;
    var dkLen = 32;
    var interruptStep = 200;

    var cb = function(derKey) {
        callback(null, new Uint8Array(derKey));
    }

    scrypt(password, salt, logN, r, dkLen, interruptStep, cb, null);
}

module.exports = Encrypt;
