
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

    socket.subscribe(window.constant.SOCKET.ROOMS.MULTISIG_CUSTODIAN);

    socket.onSubmission(function (res) {
        console.log('lottery onSubmission ', res);
        var executor = res[0].executor;
        var txid = res[0].transactionHash;
        var commandHash = res[0].commandHash
        var confirmButton = '';
        if (executor != addr) {
            confirmButton = `<input class="btn btn-warning" type="button" name='btn-confirm-move-all-fund' data-command-hash="${commandHash}" value="Confirm"><br>`;
        }

        var template = `<div class="panel panel-info" class="submission" id="commission${commandHash}">
                            <div class="panel-heading">Transaction id: <b id="txId">${txid}</b> </div>
                            <div class="panel-body">
                            ${confirmButton}
                                <b>Command hash: </b><i id="commandHash">${commandHash}</i>
                                <ul id="ulComfirmationList${commandHash}">
                                    
                                </ul>
                                
                            </div>
                        </div>`;


        if (!$(`#commission${commandHash}`).length) {
            $(`#commissionTransactionList`).append(template);
        }
        $(`#pending-${txid}`).remove();
    });

    socket.onConfirmation(function (res) {
        console.log('lottery onConfirmation', res);
        var executor = res[0].executor;
        var txid = res[0].transactionHash;
        var commandHash = res[0].commandHash;
        var confirmer = res[0].confirmer;
        var time = new Date(res[0].blockTime * 1000).toGMTString();

        var ulConfirmationListEl = $(`#ulComfirmationList${commandHash}`);
        var you = '';
        if (confirmer == addr) {
            you = '<b>(you)</b>';
            $(`input[name="btn-confirm-move-all-fund"][data-command-hash="${commandHash}"]`).remove();
        }
        if (ulConfirmationListEl) {
            var li = `<li><b>Confirmed by:</b> <i id="confirmBy">${confirmer}${you}</i> : <span id="confirmTime">${time}</span></li>`
            ulConfirmationListEl.append(li);
        }
        $(`#pending-${txid}`).remove();
    });


    socket.onExecution(function (res) {
        console.log('lottery onExecution', res);
        var executor = res[0].executor;
        var txid = res[0].transactionHash;
        var commandHash = res[0].commandHash;
        var time = new Date(res[0].blockTime * 1000).toGMTString();


        var panelBody = $(`#commission${commandHash} .panel-body`);

        if (panelBody) {
            var result = `<b>Result</b>:<span id="result" class="alert-success">Success<i>(${time})</i></span><br>`
            panelBody.append(result);
        }
    });

    socket.onExecutionFail(function (res) {
        console.log(res);
        var executor = res[0].executor;
        var txid = res[0].transactionHash;
        var commandHash = res[0].commandHash;
        var time = new Date(res[0].blockTime * 1000).toGMTString();


        var panelBody = $(`#commission${commandHash} .panel-body`);
        console.log(`commission${commandHash} .panel-body`);
        if (panelBody) {
            var result = `<b>Result</b>:<span id="result" class="alert-danger">Fail<i>(${time})</i></span><br>`
            panelBody.append(result);
        }
    });

    /**
     * Move all fund click event
     */
    $('#btn-move-all-fund').on('click', function () {
        // Get address nonce
        window.walletApi.getNonce(addr, function (err, nonce) {
            console.log('address nonce ', nonce);
            var privateKey = '';
            var pwd = prompt('Input password: ');
            loadPrivateKeyFromStorage(pwd, function (privateKey) {
                window.SmartContractCommon.lotteryMoveAllFund(addr, nonce, function (txRaw) {
                    var txHex = '0x' + window.AltaWallet.ethereum.signTransaction(privateKey, txRaw.tx_hex);
                    console.log(txHex);
                    window.walletApi.sendRawTransaction(txHex, function (err, hash) {
                        console.log(err, hash);
                        console.log($(`#ulTxInfo #${hash}`).length);
                        if (!$(`#ulTxInfo #${hash}`).length) {
                            $('#ulTxInfo').append(`<li id="${hash}"><b>${hash}</b></i>Pending</li>`);
                        }
                        if (!err && hash) {
                            console.log('append transaction submission');
                            var li = `<li id="pending-${hash}">Hash: ${hash}</li>`;
                            console.log(li);
                            $('#pending-transaction-list').append(li);
                        }
                    });
                })
            })

        })
    })


    $('#btn-toogle-move-all-fund').on('click', function () {
        // Get address nonce
        window.walletApi.getNonce(addr, function (err, nonce) {
            console.log('address nonce ', nonce);
            var privateKey = '';
            var pwd = prompt('Input password: ');
            loadPrivateKeyFromStorage(pwd, function (privateKey) {
                window.SmartContractCommon.toggleAllowWithdraw(addr, nonce, function (txRaw) {
                    var txHex = '0x' + window.AltaWallet.ethereum.signTransaction(privateKey, txRaw.tx_hex);
                    console.log(txHex);
                    window.walletApi.sendRawTransaction(txHex, function (err, hash) {
                        console.log(err, hash);
                        console.log($(`#ulTxInfo #${hash}`).length);
                        if (!$(`#ulTxInfo #${hash}`).length) {
                            $('#ulTxInfo').append(`<li id="${hash}"><b>${hash}</b></i>Pending</li>`);
                        }
                        if (!err && hash) {
                            console.log('append transaction submission');
                            var li = `<li id="pending-${hash}">Hash: ${hash}</li>`;
                            console.log(li);
                            $('#pending-transaction-list').append(li);
                        }
                    });
                })
            })

        })
    })

    $(document).on('click', 'input[name="btn-confirm-move-all-fund"]', function () {
        var commandHash = $(this).data('command-hash');
        window.walletApi.getNonce(addr, function (err, nonce) {
            var privateKey = '';
            var pwd = prompt('Input password: ');
            loadPrivateKeyFromStorage(pwd, function (privateKey) {

                console.log('commandHash ', commandHash);
                var txRaw = window.SmartContractCommon.lotteryMoveAllFundConfirm(addr, nonce, commandHash);
                var txHex = '0x' + window.AltaWallet.ethereum.signTransaction(privateKey, txRaw.tx_hex);
                console.log(txHex);
                window.walletApi.sendRawTransaction(txHex, function (err, hash) {
                    console.log(err, hash);
                    // console.log($(`#ulTxInfo #${hash}`).length);
                    // if (!$(`#ulTxInfo #${hash}`).length) {
                    //     $('#ulTxInfo').append(`<li id="${hash}"><b>${hash}</b></i>Pending</li>`);
                    // }
                    if (!err && hash) {
                        console.log('append transaction');
                        $('#pending-transaction-list').append(`<li id="pending-${hash}">Hash: ${hash}</li>`);
                    }
                })
            })
        })
    });
})