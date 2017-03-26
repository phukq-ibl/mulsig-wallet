(function (window) {
    var smartContractCommon = {};
    // window.AltaWallet.EthereumjsAbi.simpleEncode();
    // smartContractCommon.randaoRefundBounty = function (from, to, nonce, roundId) {
    //     var contractAddress = window.constant.RANDAO.contractAddress;
    //     var f = window.constant.RANDAO.refundBounty;
    //     var data = window.AltaWallet.EthereumjsAbi.simpleEncode(f, roundId);

    //     var txParams = {};
    //     txParams.from = from;
    //     txParams.to = contractAddress;
    //     txParams.nonce = nonce;
    //     txParams.value = 0;
    //     txParams.data = data;
    //     return window.AltaWallet.ethereum.createTransactionWithoutSign(txParams);
    // }

    smartContractCommon.submit = function (addressFrom, multisigAddress, addressNonce, destination, value, data, nonce) {
        var f = window.constant.MULTISIG.submit;
        var input = '0x' + arrayToStringHex(window.AltaWallet.EthereumjsAbi.simpleEncode(f, destination, value, data, nonce));
        console.log('submit' ,input);
        var txParams = {};
        txParams.from = addressFrom;
        txParams.to = multisigAddress;
        txParams.nonce = addressNonce;
        txParams.value = 0;
        txParams.data = input;
        txParams.gas = 4000000;
        console.log(txParams);
        var rawTx = window.AltaWallet.ethereum.createTransactionWithoutSign(txParams);

        return rawTx;
    }

    smartContractCommon.confirmTransaction = function (addressFrom, multisigAddress, addressNonce, transactionHash) {
        var f = window.constant.MULTISIG.confirm;
        // var hashArray = 
        var input = window.AltaWallet.EthereumjsAbi.simpleEncode(f, transactionHash);
        console.log(arrayToStringHex(input));
console.log(input);
        var txParams = {};
        txParams.from = addressFrom;
        txParams.to = multisigAddress;
        txParams.nonce = addressNonce;
        txParams.value = 0;
        txParams.data = input;
        txParams.gas = 4000000;
        return window.AltaWallet.ethereum.createTransactionWithoutSign(txParams);
    }

    smartContractCommon.changeTicketPrice = function (from, nonce, price) {
        var f = window.constant.LOTTERY.changeTicketPrice;

        var data = window.AltaWallet.EthereumjsAbi.simpleEncode(f, +price);
        // data = '0x' + arrayToStringHex(data);

        console.log(data);
        console.log(arguments);
        var rawTx = smartContractCommon.submit(from, window.constant.MULTISIG.contractAddress, nonce, window.constant.LOTTERY.contractAddress, 0, data, 0);
        return rawTx;
    }

    smartContractCommon.lotteryMoveAllFund = function (from, nonce, cb) {
        var f = window.constant.LOTTERY.moveAllFund;

        var data = window.AltaWallet.EthereumjsUtils.sha3(f);
        console.log(f);
        console.log(data);
        replaceBy0(data, 4);
        console.log(data);
        console.log(arrayToStringHex(data));

        var hashData = '0x' + (arrayToStringHex(data));
        console.log(hashData);
        var commandHash = window.constant.LOTTERY.contractAddress + 0 + '0x' + stringToHex(hashData);
        commandHash = arrayToStringHex((window.AltaWallet.EthereumjsUtils.sha3(commandHash)));

        window.walletApi.getCommandNonce(commandHash, function (err, commandNonce) {
            console.log('commandNonce ', commandNonce);
            var rawTx = smartContractCommon.submit(from, window.constant.MULTISIG.contractAddress, nonce, window.constant.LOTTERY.contractAddress, 0, data, commandNonce);
            cb(rawTx)
        });
    }

    smartContractCommon.lotteryMoveAllFundConfirm = function (from, nonce, commandHash) {
        console.log(arguments);

        var rawTx = smartContractCommon.confirmTransaction(from, window.constant.MULTISIG.contractAddress, nonce, commandHash);
        return rawTx;
    }

    smartContractCommon.lotterySellerWithdrawCommission = function (addressFrom, addressNonce, sellerSmartContractAddress) {
        var f = window.constant.LOTTERY.withdrawCommissionBySeller;
        var input = window.AltaWallet.EthereumjsAbi.simpleEncode(f, sellerSmartContractAddress);
        console.log('withdraw ',f, arrayToStringHex(input));
        return createRawTransaction(addressFrom, window.constant.LOTTERY.contractAddress, 0, addressNonce, input, 100000);
    }

    /**
     * Toggle move allow move fund
     */
    smartContractCommon.toggleAllowWithdraw = function(addressFrom, addressNonce) {
        var f = window.constant.LOTTERY.toggleAllowWithdraw;
        var input = window.AltaWallet.EthereumjsAbi.simpleEncode(f);
        console.log('toggleAllowWithdraw ',f, arrayToStringHex(input));
        return createRawTransaction(addressFrom, window.constant.LOTTERY.contractAddress, 0, addressNonce, input, 1000000);
    }

    function createRawTransaction(from , to , value, nonce, input, gas) {
         var txParams = {};
        txParams.from = from;
        txParams.to = to;
        txParams.nonce = nonce;
        txParams.value = value;
        txParams.data = input;
        txParams.gas = gas;

        return window.AltaWallet.ethereum.createTransactionWithoutSign(txParams);
    }

    window.SmartContractCommon = smartContractCommon;
})(window);