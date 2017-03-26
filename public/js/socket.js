(function (window) {

    // function separateInputData(transactionInput) {
    //     transactionInput = utils.removeHexPrefix(transactionInput);
    //     var rs = {};

    //     // Extract function hash
    //     rs.functionMask = transactionInput.substr(0, 8);
    //     rs.params = utils.splitBy64(transactionInput.substr(8));
    //     return rs;
    // }

    // function onSubmission(eventData) {
    //     var command = separateInputData(eventData);

    // }

    // function onConfirm(eventData) {
    //     var commandHash = eventData.commandHash;
    // }

    // function initConnection(host) {
    //     var socket = io.connect(host);
    // }

    var socket = function(){};

    socket.prototype.connect = function (host) {
        var self = this;
        this.socket = io.connect(host);
        this.socket.on('connect', function () {
            console.log('connected to ', host)
        });
        this.socket.on('subscribe', function(rs){
            console.log('Subscribe to: ', rs);
        })
    }

    socket.prototype.subscribe = function (room) {
        console.log('subscribe ');
        this.socket.emit('subscribe', room);
    }

    socket.prototype.onEvent = function (event, func) {
        this.socket.on(event, func);
    }

    socket.prototype.onSubmission = function (func) {
        this.onEvent(window.constant.SOCKET.EVENTS.MULTISIG.submission, function (data) {
            func(data);
        });
    }

    socket.prototype.onConfirmation = function (func) {
        this.onEvent(window.constant.SOCKET.EVENTS.MULTISIG.confirmation, function (data) {
            func(data);
        });
    }

    socket.prototype.onExecution = function (func) {
        this.onEvent(window.constant.SOCKET.EVENTS.MULTISIG.execution, function (data) {
            func(data);
        });
    }

    socket.prototype.onExecutionFail = function (func) {
        this.onEvent(window.constant.SOCKET.EVENTS.MULTISIG.executionFailure, function (data) {
            func(data);
        });
    }


    window.WalletSocket = socket;

})(window);