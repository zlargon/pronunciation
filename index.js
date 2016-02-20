#!/bin/sh
":" //# comment; exec /usr/bin/env node --harmony "$0" "$@"

var pron = require('./src/pron');

pron(process.argv)
.catch(function (e) {
  console.error(e.stack);
});
