/*

Process a file
====

Processing a file involves extracting comments
*/

var _ = require('lodash');
var fs = require('fs');
var findComments = require('./find-comments');

/*

Determine whether a token is a Level-2 heading
----

Input: MarkdownToken
Output: boolean

*/
function isLevel2Heading (token) {
    return token.type === 'heading' && token.depth === 2;
}

/*

Find all Level-2 headings
----

Input: MarkdownToken[]
Output: string[]

*/
function getSubheadings (comments) {
    var tokens = _.flatten(comments.map(function (comment) {
        return comment.tokens.filter(isLevel2Heading);
    }));

    return _.pluck(tokens, 'text');
}

/*

Find document links in comments
----

Input: MarkdownToken[]
Output: string[]

*/
function getDocLinks (comments) {
    var linkRule = /\[\[[^\]]+\]\]/g;
    return _.flatten(comments.map(function (comment) {
        return comment.tokens.map(function (token) {
            var text = token.text;
            if (!text) { return null; }

            var matches = token.text.match(linkRule);
            return matches && matches.map(function (link) {
                return link.replace(/[\[\]]/g, '');
            });
        }).filter(Boolean);
    }));
}

/*

Module interface
----

Inputs:
- filename: string
- callback: function (error | null, FileInfo)

 */
module.exports = function processFile (filename, callback) {
    fs.readFile(filename, 'utf8', function (err, src) {
        if (err) { return callback(err); }

        var comments = findComments(src);
        if (!comments.length) { return callback(null, null); }

        callback(null, {
            filename: filename,
            heading: comments[0].tokens[0].text,
            comments: comments,
            subheadings: getSubheadings(comments),
            links: getDocLinks(comments)
        });
    });
};