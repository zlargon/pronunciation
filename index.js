#!/usr/bin/env node
const pron = require('./src/pron');

pron(process.argv)
.catch(function (e) {
  console.error(e.stack);
});
