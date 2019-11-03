const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const Pool = require('./models/employee');

Pool.createTables();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.post('/auth/create-user', Pool.createEmployee);
app.post('/auth/signin', Pool.signIn);
module.exports = app;
