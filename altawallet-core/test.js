/**
 * Created by T on 4/20/2016.
 */
var Wallet = require('./lib/wallet.js');
var AltCoin = require('./lib/altcoin.js');
var Encrypt = require('./lib/encrypt.js');
//var wallet = new Wallet();
function test() {


    var seed = Wallet.generateMnemonic();

    // seed = 'dragon accuse transfer cash help couch olive idea rotate unveil divert odor'
    seed = 'copper siren differ use like egg sight where spoon learn swamp swarm'

    var coinNames = ['bitcoin', 'litecoin', 'dogecoin', 'dashcoin', 'ethereum'];
    var pwd = '1';

    // Wallet.createInstance(seed, pwd, coinNames, function (wallet) {
    //     console.log('Create Wallet instance ok')
    // });


    Wallet.createInstance(seed, 'password', coinNames, function(wallet) {
        console.log('Test create Wallet instance ok');

        // for (var i = 0; i < coinNames.length; i++) {
        //     var address = wallet.getAddress(coinNames[i], 0);
        //     var privKey = wallet.exportPrivateKey(coinNames[i], address);
        //     console.log('%s: %s', address, privKey)
        // }

        // Test serialize and deserialize
        var json = wallet.serialize();
        var wallet2 = new Wallet();
        wallet2.deserialize(json);

        var json2 = wallet2.serialize();

        // Compare 2 serialization
        console.log('Test serialize and deserialize: ' + (json2.toString() == json.toString()))

        var address = wallet2.getAddress(coinNames[0], 0);
        var privKey = wallet2.exportPrivateKey(coinNames[0], address);

        // Test encrypt and decrypt
        var msg = '123123';
        Wallet.encryptString(msg, 'password', function(data) {
            Wallet.decryptString(data, 'password2', function(data) {
                console.log('Test encrypt and decrypt(wrong password): ' + (data != msg))
            })
            Wallet.decryptString(data, 'password', function(data) {
                console.log('Test encrypt and decrypt(right password): ' + (data == msg))
            })
        })

        //Test change password
        var newPassword = '123';
        wallet.changePassword('password', newPassword, newPassword, function(newWallet) {
            var address2 = wallet2.getAddress(coinNames[0], 0);
            var privKey2 = wallet2.exportPrivateKey(coinNames[0], address);
            Encrypt.deriveKeyFromPassword('password', function(err, derivedKey) {
                var oldPrivateKey = Encrypt.decryptString(privKey, derivedKey);
                Encrypt.deriveKeyFromPassword('password', function(err, derivedKey) {
                    var newPrivateKey = Encrypt.decryptString(privKey2, derivedKey);

                    console.log('Test change password: ' + (oldPrivateKey == newPrivateKey));
                });
            })
        });

    });

}

function testCreateRawTransactionBTC() {
    var seed = 'dragon accuse transfer cash help couch olive idea rotate unveil divert odor'

    var coinNames = ['bitcoin'];
    var pwd = '1';

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {

        var coinName = 'bitcoin',
            txParams = {
                from: wallet.getFirstAddress('bitcoin'),
                to: wallet.getAddress('bitcoin', 1),
                value: 1,

                listUnspent: [{
                        "txid": "387c83e0f9f1a3e36369697b6906e5991328d5689c11572999527b8143801776",
                        "output_no": 0,
                        "script_asm": "OP_DUP OP_HASH160 40795ac592372238616b05f311faf6f2f3aa58e3 OP_EQUALVERIFY OP_CHECKSIG",
                        "script_hex": "76a91440795ac592372238616b05f311faf6f2f3aa58e388ac",
                        "value": "1.01",
                        "confirmations": 126,
                        "time": 1461397098
                    }, {
                        "txid": "387c83e0f9f1a3e36369697b6906e5991328d5689c11572999527b8143801776",
                        "output_no": 0,
                        "script_asm": "OP_DUP OP_HASH160 40795ac592372238616b05f311faf6f2f3aa58e3 OP_EQUALVERIFY OP_CHECKSIG",
                        "script_hex": "76a91440795ac592372238616b05f311faf6f2f3aa58e388ac",
                        "value": "0.91",
                        "confirmations": 126,
                        "time": 1461397098
                    }


                ]
            };

        wallet.createRawTransaction(coinName, txParams, pwd, function(tx) {
            console.log('testCreateRawTransactionBTC: ' + tx);
        });


    });



}

function testCreateRawTransactionETH() {
    var seed = 'dragon accuse transfer cash help couch olive idea rotate unveil divert odor'

    var coinNames = ['ethereum'];
    var pwd = '1';

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {

        // Ethereum
        var coinName = 'ethereum',
            txParams = {
                from: wallet.getFirstAddress(coinName),
                to: wallet.getAddress(coinName, 1),
                value: 0.01
            };

        wallet.createRawTransaction(coinName, txParams, pwd, function(tx) {
            console.log('testCreateRawTransactionETH: ' + tx)
        });

    });
}

function testCreateAddress() {
    var seed = 'copper siren differ use like egg sight where spoon learn swamp swarm'

    var coinNames = ['bitcoin', 'litecoin', 'dogecoin', 'dashcoin', 'ethereum', 'bitcoinTestnet', 'litecoinTestnet', 'dogecoinTestnet', 'dashcoinTestnet', 'ethereumTestnet'];

    // var coinNames = ['bitcoin', 'litecoin', 'dogecoin', 'dashcoin', 'ethereum'];

    var pwd = '1';

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {
        // console.log(wallet);
        for (var i = 0; i < coinNames.length; i++) {
            var coinName = coinNames[i]
            var address = wallet.getFirstAddress(coinName);
            console.log('Test create address: %s:%s', coinName, address);
        }

    });
}

function getPrivateKey (){
    var seed = 'copper siren differ use like egg sight where spoon learn swamp swarm';
    var pwd = '1';
    var coinNames = ['ethereum'];

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {
        // console.log(wallet);
        for (var i = 0; i < coinNames.length; i++) {
            var coinName = coinNames[i]
            var address = wallet.getFirstAddress(coinName);
            var privateKey = wallet.exportPrivateKey(coinName, address);

            Encrypt.deriveKeyFromPassword('1', function(err, derivedKey) {
                privateKey = Encrypt.decryptString(privateKey, derivedKey);
                console.log(coinName, address, privateKey);
            });
        }

    });
}

function testCreateRawTransactionETHData() {
    var seed = 'copper siren differ use like egg sight where spoon learn swamp swarm';

    var coinNames = ['ethereum'];
    var pwd = '1';

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {

        // Ethereum
        var coinName = 'ethereum',
            txParams = {
                from: '0x0e64a460bb544fde9767830b6deef67d406778cf',
                to: '0x3A05799477Da081Ea13680280eae7ca05C2e6Bd3',
                data: '0x3e58c58c0000000000000000000000008ce29b887ee93fa9ba55f14103fb67a9e006c467',
                value: 10,
                nonce: 0,
                gas:1000000
            };

        wallet.createRawTransaction(coinName, txParams, pwd, function(tx) {
            console.log('testCreateRawTransactionETH: ' + tx.tx_hex)
        });

    });
}

function testGetContractData(){
    var mask = 'split(address,address)';
    // var mask = 'send(address)';
    var id = Wallet.createFunctionId(mask);
    console.log(id);

    var data = Wallet.createContractData("split(address,address)", "0x571Dae74C1782CAde0BCbF4570B816281e1Eb1ed", "0xF173ed121447fDfA83af71eB4C4B6087Dc255E38");

    console.log(data.toString('hex'));
    var data2 = Wallet.simpleEncode(id, "0x571Dae74C1782CAde0BCbF4570B816281e1Eb1ed", "0xF173ed121447fDfA83af71eB4C4B6087Dc255E38");
    console.log(data2.toString('hex'));
    console.log(data2.toString('hex')==data.toString('hex'));
}

function testSendToken() {
 // var mask = 'split(address,address)';
    var mask = 'transfer(address,uint256)';
    // var mask = 'send(address)';
    var id = Wallet.createFunctionId(mask);

    var data = Wallet.createContractData(mask, "0xe389898ebdc75fd79d1b0da04fa913b93c822beb", 2);

    console.log(data.toString('hex'));


    var seed = 'copper siren differ use like egg sight where spoon learn swamp swarm';

    var coinNames = ['ethereum'];
    var pwd = '1';

    Wallet.createInstance(seed, pwd, coinNames, function(wallet) {

        // Ethereum
        var coinName = 'ethereum',
            txParams = {
                from: '0x0e64a460bb544fde9767830b6deef67d406778cf',
                to: '0x0e567e586c4b7f828491c6cd4b2b901312a36078',
                data: data.toString('hex'),
                value: 0,
                nonce: 0,
                gas:5183622
            };

        wallet.createRawTransaction(coinName, txParams, pwd, function(tx) {
            console.log('testCreateRawTransactionETH: ' + tx.tx_hex)
        });

    });

}
// test();

// testCreateRawTransactionETH();

// testCreateRawTransactionBTC();

// testCreateAddress();

//getPrivateKey();
//testCreateRawTransactionETHData();

// testGetContractData();

testSendToken();



