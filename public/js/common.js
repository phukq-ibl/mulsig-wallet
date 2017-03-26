
function savePrivateKeyToStorage(privateKey, password, cb) {
    window.AltaWallet.wallet.encryptString(privateKey, password, function (data) {
        window.localStorage.setItem(window.constant.PRIVATE_KEY, JSON.stringify(data));
        cb()
    });
}

function loadPrivateKeyFromStorage(password, cb) {
    var privateKey = window.localStorage.getItem(window.constant.PRIVATE_KEY);
    console.log('privateKey ', privateKey);
    window.AltaWallet.wallet.decryptString(JSON.parse(privateKey), password, function (data) {
        cb(data);
    })
}


function arrayToStringHex(byteArray) {
    var rs = '';
    for (var i = 0; i < byteArray.length; i++) {
        rs += ('0' + byteArray[i].toString(16)).slice(-2);
    }
    return rs;
}

function stringToHex(str) {
    var rs = '';
    for(var i = 0; i < str.length; i++) {
        rs += str.charCodeAt(i).toString(16);
    }
    return rs;
}

function leftPad64Zero(s) {
    var zero = '0'.repeat(64);
    
    var sliced = zero.substr(0, 64 - s.length);
    
    var rs = sliced + s;
    
    return rs;
}

function rightPad64Zero(s) {
    var zero = '0'.repeat(64);
    
    var sliced = zero.substr(0, 64 - s.length);
    
    var rs = s + sliced ;
    
    return rs;
}

function replaceBy0(arr, start) {
    var lackLenght = 32 - arr.length;
    for(var i = start; i < arr.length; i++) {
        arr[i] = 0;
    }
}

function createDataForSubmit(){}