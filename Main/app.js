const express = require('express')
const app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/favicon.ico', (req, res) => res.writeHead(404));

app.use(express.static('public'));

app.use('/', require('./router'));

app.listen(3000);