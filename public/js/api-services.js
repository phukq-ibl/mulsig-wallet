(function (window) {
    var walletApi = {};
    // walletApi.getNonce = function (address, cb) {
    //     var url = `${window.walletConfig.ETHER_API_URL_ROOT}/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest`;
    //     $.get(url, function (data, status) {
    //         console.log(data);
    //         var nonce = data.result;
    //         var err = null;
    //         cb(err, nonce);
    //     });
    // }

    // walletApi.sendRawTransaction = function (txRaw, cb) {
    //     var url = `${window.walletConfig.ETHER_API_URL_ROOT}/api?module=proxy&action=eth_sendRawTransaction&hex=${txRaw}`;
    //     $.get(url, function (data, status) {
    //         var err, hash;
    //         cb(err, hash);
    //     });
    // }
    walletApi.getNonce = function (address, cb) {
        var url = `${window.walletConfig.API_URL_ROOT}/api/addr/${address}/totalTxSent/pending`;
        $.get(url, function (data, status) {
            console.log(data);
            if (data) {
                var nonce = parseInt('0x' + data.result, 16);
                cb(null, nonce);
            } else {
                console.log(data);
                console.log(url);
                throw 'getNonce ERROR'
            }
        });
    }

    walletApi.sendRawTransaction = function (txRaw, cb) {
        var url = `${window.walletConfig.API_URL_ROOT}/api/tx/send`;
        $.post(url, { txHex: txRaw }, function (data, status) {
            if(!data) {
                throw 'sendRawTransaction undefined data'
            } else if(data.error) {
                throw data.error
            } else {
                cb(null, data.result);
            }
        });
    }

    walletApi.getCommandNonce = function (hash, cb) {
        var url = `${window.walletConfig.API_URL_ROOT}/api/multisig/nonce/${hash}`;
        $.get(url, function (data, status) {
            var err, status;
            if (data) {
                cb(null, data.result);
            } else {
                console.log(data);
                throw 'getCommandNonce ERROR'
            }
        });
    }

    window.walletApi = walletApi;
})(window);