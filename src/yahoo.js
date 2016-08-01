const _async_ = require('co').wrap;
const fetch   = require('node-fetch');
const cheerio = require('cheerio');

module.exports = _async_(function * (word) {
  if (typeof word !== 'string' || word.length === 0) {
    throw new TypeError('word should be a string');
  }

  // normalize
  word = word.trim().toLowerCase().replace(/_/g, ' ');

  const url = `http://tw.dictionary.search.yahoo.com/search?p=${word}&fr2=dict`;
  const res = yield fetch(url, { timeout: 10 * 1000 });
  if (res.status !== 200) {
    throw new Error(`request to ${url} failed, status code = ${res.status} (${request.statusText})`);
  }

  const html = yield res.text();
  const $ = cheerio.load(html);

  // check the word from title
  const term = $('#term').text().trim().toLowerCase().replace(/·/g, '');
  if (term !== word) {
    let msg = `'${word}' is not found from yahoo`;
    if (term !== '') {
      msg += `. Do you mean the word '${term}' ?`;
    }

    const err = new Error(msg);
    err.code = 'ENOENT';
    throw err;
  }

  // get pronunciation
  const pron = $('#pronunciation_pos').text().trim();
  if (pron === '') {
    const err = new Error(`the pronunciation of '${word}' is not found from yahoo`);
    err.code = 'ENOENT';
    throw err;
  }

  const kk = pron.match(/KK\[[^\]]+\]/i);
  const dj = pron.match(/DJ\[[^\]]+\]/i);
  const ipa = pron.match(/IPA\[[^\]]+\]/i);

  return {
    kk:  kk  === null ? null : kk[0].substr(2),
    dj:  dj  === null ? null : dj[0].substr(2),
    ipa: ipa === null ? null : ipa[0].substr(3)
  };
});
