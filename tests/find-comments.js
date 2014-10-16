var tape = require('tape');
var findComments = require('../lib/find-comments');
var fs = require('fs');

tape('Find comments in a source file', function (t) {
  var fixture = fs.readFileSync(__dirname + '/fixtures/c-style-comments.c', 'utf-8');
  var docItems = findComments(fixture);

  t.deepEqual(
    docItems[0].tokens[0],
    { type: 'heading', depth: 1, 'text': 'Block comment with space prefix' },
    'First token is the level-1 heading');

  t.equal(
    docItems[1].tokens[0].type,
    'blockquote_start',
    'Single-line comments are rendered as blockquotes');

  t.equal(
    docItems[1].tokens[1].text,
    'Single-line comment',
    'Correct text of single line comment');
  
  t.end();
});
