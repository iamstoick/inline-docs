/* global module */
/*

These comments are not included in docs since they come before the h1

*/

var marked = require('marked');
var excludePreHeadingMarkdownTokens = require('./exclude-pre-heading-markdown-tokens');
var extractComments = require('./extract-c-comments');
var parseDirectives = require('./parse-directives');

/*

  Find comments in source code
  ====

*/

/*

  Zeroing comment indentation
  ----

  Often a comment will be indented, so we need to make sure that doesn't affect the markdown interpretation.

  We'll assume that the leading whitespace on the first non-empty line represents the indentation applied to all lines. We can subtract this from all lines to zero the indentation.

  Inputs
  - comment: CommentToken

  Output: CommentToken

*/
function zeroCommentIndentation (comment) {
  var lines = comment.value.split('\n');
  var len = lines.length;
  var matches;
  var i;

  for (i=0; i<len; i+=1) {
    //> don't consider empty lines as they are not a reliable indication of indentation
    if (lines[i].trim().length === 0) { continue; }

    matches = lines[i].match(/^\s*/);
    break;
  }

  var indentation = matches[0].length;
  if (indentation > 0) {
    comment.value = lines
      .map(function (line) { return line.substr(indentation); })
      .join('\n');
  }

  return comment;
}

/*

Convert a comment to a doc item
----

Inputs
- comment: CommentToken

Output: DocItem
*/
function commentToDocItem (comment) {
  var tokens = marked.lexer(comment.value);

  return {
    line: comment.range.start,
    tokens: tokens
  };
}

/*

Determine whether a comment is included
----

Inputs:
- comment: CommentToken

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

Output: DocItem[]

See also:
- [[Overview]] and [[Overview][How are docs generated?]]
- [[Exclude pre-heading markdown tokens]]

*/
module.exports = function (src) {
  var comments = extractComments(src);
  var directives = parseDirectives(comments);

  //> `ignore` directive is set, so ignore everything in this file (See also [[Parsing directives]])
  if (directives.ignore) { return []; }

  comments = comments.filter(isValidComment);
  comments.forEach(zeroCommentIndentation);

  var docItems = comments.map(commentToDocItem);
  return excludePreHeadingMarkdownTokens(docItems);
};
