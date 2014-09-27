/* global module */
// these comments are not included in docs since they come before the h1

var acorn = require('acorn');
var marked = require('marked');
var excludePreHeadingComments = require('./exclude-pre-heading-comments');

/*

Find comments in source code
====

*/

function formatComment (comment) {
  var tokens = marked.lexer(comment.value.trim());

  return {
    line: comment.loc.start.line,
    tokens: tokens
  };
}

/*

Extract comments from a javascript file
----

We use a javascript parser to locate all comments, along with their text and location in the file.

Inputs:
- src: string

Output: Comment[]

*/
function extractComments (src) {
  var comments = [];
  var ast = acorn.parse(src, {
    locations: true,
    onComment: comments
  });

  return comments;
}

/*

Determine whether a comment is included
----

Inputs:
- comment: Comment

Output: boolean

*/
function isValidComment (comment) {
  var isMultiLine = comment.value.indexOf('\n') >= 0;
  if (isMultiLine) { return true; }

  //> single-line comments are only included if they begin with a `>` (see [[Inline Docs][Rules]])
  return comment.value[0] === '>';
}

/*

Module Interface
----

Inputs:
- src: string

Output: Comment[]

See also:
- [[Docs]] and [[Docs][How are documents generated?]]
- [[Exclude pre-heading comments]]

*/
module.exports = function (src) {
  var comments = extractComments(src)
      .filter(isValidComment)
      .map(formatComment);

  return excludePreHeadingComments(comments);
};
