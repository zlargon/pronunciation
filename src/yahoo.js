var util      = require('util');
var coroutine = require('co');
var fetch     = require('node-fetch');
var cheerio   = require('cheerio');

module.exports = coroutine.wrap(function * (word) {
  if (typeof word !== 'string' || word.length === 0) {
    throw new TypeError('word should be a string');
  }

  // replace '_' to ' ', and convert to lower case
  word = word.replace(/_/g, ' ').toLowerCase();

  var url = 'http://tw.dictionary.search.yahoo.com/search?p=' + word + '&fr2=dict';
  var res = yield fetch(url, {
    timeout: 10 * 1000
  });
  if (res.status !== 200) {
    var msg = util.format('request to %s failed, status code = %d (%s)', url, res.status, res.statusText);
    throw new Error(msg);
  }

  var $ = cheerio.load(yield res.text());
  var pron = $('#pronunciation_pos').text().trim();
  if (pron === '') {
    var err = new Error('the pronunciation of "' + word + '" is not found from yahoo');
    err.code = 'ENOENT';
    throw err;
  }

  // check pronunciation format
  if (/^KK\[.+\] DJ\[.+\] $/.test(pron)) {
    throw new Error('unknown pronunciation: ' + pron);
  }

  pron = pron.split(' ');
  return {
    kk: pron[0].substr(2),
    dj: pron[1].substr(2)
  };
});
