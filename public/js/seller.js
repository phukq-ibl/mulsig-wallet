
$(document).ready(function () {
    var addr = '0x' + window.localStorage.getItem(window.constant.ADDRESS);
    $('#address').html(addr);

    // $('#btn-change-ticket-price').on('click', function () {
    //     var price = +$('#txt-ticket-price').val();

    //     window.walletApi.getNonce(addr, function (err, nonce) {
    //         var privateKey = '';
    //         var pwd = prompt('Input password: ');
    //         loadPrivateKeyFromStorage(pwd, function (privateKey) {
    //             var txRaw = window.SmartContractCommon.changeTicketPrice(addr, nonce, price);
    //             var txHex = '0x' + window.AltaWallet.ethereum.signTransaction(privateKey, txRaw.tx_hex);
    //             console.log(txHex);
    //             window.walletApi.sendRawTransaction(txHex, function (err, hash) {
    //                 console.log(err, hash);
    //             })
    //         })
    //     })
    // })

    var socket = new window.WalletSocket();
    socket.connect(window.walletConfig.API_URL_ROOT);
    socket.subscribe(window.constant.SOCKET.ROOMS.LOTTERY);
    socket.onEvent(window.constant.SOCKET.EVENTS.LOTTERY.withdrawCommisionBySeller, function (rs) {
        console.log('withdrawCommisionBySeller ', rs);
        console.log(rs[0].executor);
        console.log(addr);
        console.log(addr == rs[0].executor);
        console.log(addr != rs[0].executor);
        if (rs[0].executor != addr) {
            console.log('return');
            return;
        }
        var contractAddress = rs[0].contractAddress;
        var sellerAddress = rs[0].sellerAddress;
        var withdrawalAddress = rs[0].withdrawalAddress;
        var commission = rs[0].commission;
        var txid = rs[0].transactionHash;

        var template = `<div class="panel panel-info">
                            <div class="panel-heading">Txid: ${txid}</div>
                            <div class="panel-body">
                                <b>Withdraw Address: </b><i>${withdrawalAddress}</i><br>
                                <b>Amount: </b><i>${commission}</i> (wei)
                            </div>
                        </div>`;
        $('#withdraw-info-list').append(template);
        $(`#pending-${txid}`).remove();
    })

    /**
     * Move all fund click event
     */
    $('#btn-withdraw-commission').on('click', function () {
        // Get address nonce
        var smartContractAddress = $('#txt-withdraw-contract-address').val();
        if (!window.AltaWallet.EthereumjsUtils.isValidAddress(smartContractAddress)) {
            return alert('Address is not valid');
        }

        window.walletApi.getNonce(addr, function (err, nonce) {
            console.log('address nonce ', nonce);
            var privateKey = '';
            var pwd = prompt('Input password: ');
            loadPrivateKeyFromStorage(pwd, function (privateKey) {
                var txRaw = window.SmartContractCommon.lotterySellerWithdrawCommission(addr, nonce, smartContractAddress);
                var txHex = '0x' + window.AltaWallet.ethereum.signTransaction(privateKey, txRaw.tx_hex);
                console.log(txHex);
                window.walletApi.sendRawTransaction(txHex, function (err, hash) {
                    console.log(err, hash);
                    if (!err && hash) {
                        console.log('append transaction');
                        $('#pending-transaction-list').append(`<li id="pending-${hash}">Hash: ${hash}</li>`);
                    }
                });
            })

        })
    })

})