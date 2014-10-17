/**

Test Extracting Links
====

Test cases for [[Extract Document Links]].

This will be run as part of `npm test`.

*/
var tape = require('tape');
var extractLinks = require('../lib/extract-links');

tape('Extracting links', function (t) {
  var links = extractLinks('foo [[Bar]] and [[Baz][Krog]] but not `[[Rang]]`');
  t.deepEqual(
    links,
    [['Bar'], ['Baz', 'Krog']],
    'All doc links are extracted unless wrapped in backticks');
  t.end();
});

tape('Replacing links', function (t) {
  var text = 'foo [[Bar]] and [[Baz][Krog]] but not `[[Rang]]`';
  var result = extractLinks.replace(text, function (parts) {
    return '{{' + parts.join('->') + '}}';
  });
  t.equal(
    result,
    'foo {{Bar}} and {{Baz->Krog}} but not `[[Rang]]`',
    'Links are replaced using the provided function');
  t.end();
});
