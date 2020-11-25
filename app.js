const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.json());

app.get('/', (req, res, next) => {
  res.send('hello');
});

app.listen(5000);
