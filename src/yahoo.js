const _async_ = require('co').wrap;
const fetch   = require('node-fetch');
const cheerio = require('cheerio');

module.exports = _async_(function * (word) {
  if (typeof word !== 'string' || word.length === 0) {
    throw new TypeError('word should be a string');
  }

  // replace '_' to ' ', and convert to lower case
  word = word.replace(/_/g, ' ').toLowerCase();

  const url = `http://tw.dictionary.search.yahoo.com/search?p=${word}&fr2=dict`;
  const res = yield fetch(url, {
    timeout: 10 * 1000
  });
  if (res.status !== 200) {
    throw new Error(`request to ${url} failed, status code = ${res.status} (${request.statusText})`);
  }

  const $ = cheerio.load(yield res.text());
  let pron = $('#pronunciation_pos').text().trim();
  if (pron === '') {
    let err = new Error(`the pronunciation of "${word}" is not found from yahoo`);
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
