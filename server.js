var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/[0-9]+', (req, res) => {
  res.sendFile(path.join(__dirname + '/show.html'));
});

app.get('/chartjs', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/chart.js/dist/Chart.js'));
});

app.get('/chartcss', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/chart.js/dist/Chart.css'));
});

app.get('/githubToken', (req, res) => {
  fs.readFile(path.join(__dirname + '/.env'), (err, data) => {
    if (err) {
      next(err);
    }

    const tokenWithNewline = data.toString().split('=')[1];
    const token = tokenWithNewline.split('\n')[0];

    res.json({token});
  });
});

app.listen(8080);
