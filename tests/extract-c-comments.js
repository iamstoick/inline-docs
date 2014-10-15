/*

Test Extracting C Comments
====

Test cases for [[Extract C Comments]].

This will be run as part of `npm test`.

*/
var tape = require('tape');
var extractComments = require('../lib/extract-c-comments');
var fs = require('fs');

tape('Extracting c comments', function (t) {
  var fixture = fs.readFileSync(__dirname + '/fixtures/c-style-comments.c', 'utf-8');
  var comments = extractComments(fixture);

  t.deepEqual(
    comments[0].commentRange,
    { start: 1, end: 5 },
    'Correct start and end lines for asterisk-prefixed block comment');

  t.deepEqual(
    comments[1].commentRange,
    { start: 7, end: 11 },
    'Correct start and end lines for space-prefixed block comment');

  t.deepEqual(
    comments[2].commentRange,
    { start: 13, end: 13 },
    'Correct start and end lines for single-line comment');

  t.deepEqual(
    comments[3].commentRange,
    { start: 15, end: 19 },
    'Correct start and end lines for single-line comment spanning multiple lines');

  t.end();
});
