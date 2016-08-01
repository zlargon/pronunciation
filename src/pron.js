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

  for (let i = 0; i < program.args.length; i++) {
    const word = program.args[i];

    try {
      // 1. get pronunciation
      const pron = yield yahoo(word);
      if (pron.kk === null) {
        console.log(`${word} (No KK)`);

        // show all pronunciation
        for (k in pron) {
          const v = pron[k];
          if (v) console.log(`${k.toUpperCase()}: ${v}`)
        }
        console.log('');
        continue;
      }

      // 2. print result on screen
      console.log(word);
      console.log(pron.kk + '\n');

      // 3. copy KK pronunciation to the clipboard
      if (program.args.length === 1) {
        pbcopy(pron.kk);
      }

    } catch (e) {
      console.log(e.code === 'ENOENT' ? e.message : e.stack);
      console.log('');
    }
  }
});
