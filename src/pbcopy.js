const exec = require('child_process').execSync;

module.exports = function (text) {
  switch (process.platform) {
    case 'darwin':
      exec(`printf '%s' '${text}' | pbcopy`);
      break;

    // TODO: support others platform
    case 'win32':
    default:
      break;
  }
};
