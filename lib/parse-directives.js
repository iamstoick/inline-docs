/*

Parsing directives
====

Directives allow you to instruct the doc parser how to handle the current file.

Rules:
- Any single-line comment may contain a directive, in the form of `inline-docs:<key> [value]`.
- A `key` may only contain letters and dashes.
- The `value` is optional, and if omitted we'll assume `key` is a flag and set the value to `true`.

*/
module.exports = function parseDirectives (comments) {
  var directives = {};
  var pattern = /inline-docs:([a-z\-]+) ?(.*)?/;
  comments.forEach(function (c) {
    //> ignore multi-line comments
    if (c.value.indexOf('\n') >= 0) { return; }

    var matches = c.value.match(pattern);
    if (!matches) { return; }

    //> treat directives without values as a boolean flag
    var val = matches[2] !== undefined ? matches[2].trim() : true;
    var key = matches[1];

    directives[key] = val;
  });

  return directives;
};
