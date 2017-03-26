var express = require('express');
var path = require("path");
var app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
    //   res.send('Hello World!')
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.get('/dashboard', function (req, res) {
    //   res.send('Hello World!')
    res.sendFile(path.join(__dirname + '/public/dashboard.html'));
})
app.get('/randao', function (req, res) {
    //   res.send('Hello World!')
    res.sendFile(path.join(__dirname + '/public/randao.html'));
})
app.get('/lottery', function (req, res) {
    //   res.send('Hello World!')
    res.sendFile(path.join(__dirname + '/public/lottery.html'));
})

app.get('/seller', function (req, res) {
    //   res.send('Hello World!')
    res.sendFile(path.join(__dirname + '/public/seller.html'));
})

var PORT = 4000;

app.listen(PORT, function () {
    console.log(`Admin Wallet demo started on port ${PORT}!`)
})
