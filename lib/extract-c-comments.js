/*

Extract C-Style Comments
====

Most source files will use one or both forms of c-style comments (block or single-line),
so we can use a generic approach to extracting comments.

*/
var cdoc = require('cdocparser');

module.exports = function (code) {
  var extractor = new cdoc.CommentExtractor(function () {});
  return extractor.extract(code).map(function (item) {
    return {
      value: item.lines.join('\n'),
      range: item.commentRange
    };
  });
};
