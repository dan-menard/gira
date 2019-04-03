var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.use(express.static('public'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/githubToken', function(req, res) {
  fs.readFile(path.join(__dirname + '/.env'), function(err, data) {
    if (err) {
      next(err);
    }

    const tokenWithNewline = data.toString().split('=')[1];
    const token = tokenWithNewline.split('\n')[0];

    res.json({token});
  });
});

app.listen(8080);
