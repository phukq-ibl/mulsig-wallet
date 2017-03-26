// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731

module.exports = {
    bitcoin: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
        dustThreshold: 546 // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/core.h#L151-L162
    },
    bitcoinTestnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
        dustThreshold: 546
    },
    litecoin: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x019da462,
            private: 0x019d9cfe
        },
        pubKeyHash: 0x30,
        scriptHash: 0x05,
        wif: 0xb0,
        dustThreshold: 0 // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
    },
    litecoinTestnet: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x019da462,
            private: 0x019d9cfe
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xb0,
        dustThreshold: 0 // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
    },
    dogecoin: {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bip32: {
            public: 0x02facafd,
            private: 0x02fac398
        },
        pubKeyHash: 0x1e,
        scriptHash: 0x16,
        wif: 0x9e,
        dustThreshold: 0 // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/core.h#L155-L160
    },
    dogecoinTestnet: {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bip32: {
            public: 0x02facafd,
            private: 0x02fac398
        },
        pubKeyHash: 0x71,
        scriptHash: 0xc4,
        wif: 0x9e,
        dustThreshold: 0 // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/core.h#L155-L160
    },
    dashcoin: {
        messagePrefix: '\x19Dash Signed Message:\n',
        bip32: {
            public: 0x02FE52F8,
            private: 0x02FE52CC
        },
        pubKeyHash: 0x4C,
        scriptHash: 0x10,
        wif: 0xCC,
        dustThreshold: 5460 // https://github.com/dashpay/dash/blob/master/src/primitives/transaction.h
    },
    dashcoinTestnet: {
        messagePrefix: '\x19Dash Signed Message:\n',
        bip32: {
            public: 0x02FE52F8,
            private: 0x02FE52CC
        },
        pubKeyHash: 139,
        scriptHash: 19,
        wif: 0xCC,
        dustThreshold: 5460 // https://github.com/dashpay/dash/blob/master/src/primitives/transaction.h
    },
    namecoin: {
        messagePrefix: '\x19Namecoin Signed Message:\n',
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4
        },
        pubKeyHash: 0x34,
        scriptHash: 0xD,
        wif: 0xB4,
        dustThreshold: 54600 // https://github.com/domob1812/namecore/blob/master/src/primitives/transaction.h
    }
}
