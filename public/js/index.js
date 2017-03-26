$(document).ready(function () {


    $('#btn-use-private-key').on('click', function () {
        var privateKey = $('#txt-private-key').val();
        console.log(privateKey);

        if (!privateKey || privateKey.trim().length != 64) {
            return alert('Private key is wrong format');
        }
        privateKey = privateKey.trim();
        var pwd = prompt("Input your password");
        saveWalletInfo(privateKey, pwd, function () {
            window.location.href = 'lottery';
        })
    })
})

function saveWalletInfo(privateKey, pwd, cb) {
    savePrivateKeyToStorage(privateKey, pwd, function () {
        var address = window.AltaWallet.ethereum._computeAddressFromPrivKey(privateKey);
        window.localStorage.setItem(window.constant.ADDRESS, address);
        cb();
    });
}