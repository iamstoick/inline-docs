/**

Test Extracting C-Style Comments
====

Test cases for [[Extract C-Style Comments]].

This will be run as part of `npm test`.

*/
var tape = require('tape');
var extractComments = require('../lib/extract-c-comments');
var fs = require('fs');

tape('Extracting c comments', function (t) {
  var fixture = fs.readFileSync(__dirname + '/fixtures/c-style-comments.c', 'utf-8');
  var comments = extractComments(fixture);

  t.equal(
    comments[0].value,
    '\nBlock comment with asterisk prefix\n',
    'Asterisk prefixes are excluded from comment body');

  t.deepEqual(
    comments[0].range,
    { start: 1, end: 5 },
    'Correct start and end lines for asterisk-prefixed block comment');

  t.deepEqual(
    comments[1].range,
    { start: 7, end: 12 },
    'Correct start and end lines for space-prefixed block comment');

  t.deepEqual(
    comments[2].range,
    { start: 14, end: 14 },
    'Correct start and end lines for single-line comment');

  t.deepEqual(
    comments[3].range,
    { start: 16, end: 20 },
    'Correct start and end lines for single-line comment spanning multiple lines');

  t.end();
});
