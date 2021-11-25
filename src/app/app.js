const express = require('express');
const app = express();
const path = require('path');
const swig = require('swig');

app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'html');
// app.enable('trust proxy');
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function (req, res) {
  res.render('index.html');
});

app.listen(3000, () => {
  console.log('Web Server port:', 3000);
});
