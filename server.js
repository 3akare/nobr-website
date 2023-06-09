const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to html
app.set("view engine", "ejs");

app.use('/css', express.static(path.resolve(__dirname, 'assets/css')));
app.use('/images', express.static(path.resolve(__dirname, 'assets/images')));
app.use('/js', express.static(path.resolve(__dirname, 'assets/js')));

app.use('/', require('./server/routes/router'));

const server = app.listen(PORT, () => {
  console.log(`Connected on PORT ${PORT}`);
});
