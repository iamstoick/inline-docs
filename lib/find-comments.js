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

function extractComments (src) {
    var comments = [];
    var ast = acorn.parse(src, {
        locations: true,
        onComment: comments
    });

    return comments;
}

/*

Module Interface
----

Inputs:
- src: string

Output: Array<Comment>

See also:
- [[Docs]] and [[Docs][How are documents generated?]]
- [[Exclude pre-heading comments]]

*/
module.exports = function (src) {
    var comments = extractComments(src).map(formatComment);
    return excludePreHeadingComments(comments);
};
