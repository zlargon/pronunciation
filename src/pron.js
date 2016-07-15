const _async_   = require('co').wrap;
const commander = require('commander').Command;
const pkg       = require('../package.json');
const yahoo     = require('./yahoo');
const pbcopy    = require('./pbcopy');

module.exports = _async_(function * (process_argv) {
  const program = new commander('pron');
  program
    .usage('<words...>')
    .version(pkg.version)
    .parse(process_argv);

  // show help info if input is empty
  if (process_argv.length <= 2) {
    program.help();
  }

  let pron = null;
  for (let i = 0; i < program.args.length; i++) {
    const word = program.args[i];

    try {
      pron = yield yahoo(word);
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
