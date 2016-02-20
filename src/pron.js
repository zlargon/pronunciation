var coroutine = require('co');
var commander = require('commander').Command;
var pkg       = require('../package.json');
var yahoo     = require('./yahoo');
var pbcopy    = require('./pbcopy');

module.exports = coroutine.wrap(function * (process_argv) {
  var program = new commander('pron');
  program
    .usage('<words...>')
    .version(pkg.version)
    .parse(process_argv);

  // show help info if input is empty
  if (process_argv.length <= 2) {
    program.help();
  }

  for (var i = 0; i < program.args.length; i++) {
    var word = program.args[i];

    try {
      var pron = yield yahoo(word);
      console.log(word + ':');
      console.log('KK ' + pron.kk);
      console.log('DJ ' + pron.dj);
      console.log('');

    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(word + ' (Not Found)\n');
      }
    }
  }

  // copy KK Pronunciation to the clipboard
  if (program.args.length === 1) {
    pbcopy(pron.kk);
  }
});
