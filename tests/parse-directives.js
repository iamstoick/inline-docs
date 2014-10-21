/*

Test Parsing Directives
====

Test cases for [[Parsing directives]].

This will be run as part of `npm test`.

*/
var tape = require('tape');
var parseDirectives = require('../lib/parse-directives');

tape('Parsing directives', function (t) {
  var comments = [
    { value: 'inline-docs:flag-directive' },
    { value: 'inline-docs:directive-with a value  ' },
    { value: 'non-directive comment' },
    { value: 'inline-docs:invalid\n This directive is invalid because the comment spans 2 lines' }
  ];
  var directives = parseDirectives(comments);

  t.equal(Object.keys(directives).length, 2, 'Found only valid directives');
  t.equal(directives['flag-directive'], true, 'Parsed a flag directive');
  t.equal(
    directives['directive-with'],
    'a value',
    'Parsed a value directive (and trimmed trailing whitespace from the value)');

  t.end();
});
