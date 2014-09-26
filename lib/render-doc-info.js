/*

Rendering the document
====

After extracting comments we need to put it all together. The end result will be:

- a single HTML element containing all content rendered from markdown.
- each level-1 heading is rendered as a section.
- each comment is rendered with an extra element that gives a reference back to the source file it came from.
- before converting markdown to html we also replace special "Doc Links" with the markdown equivalent.

*/

var format = require('util').format;
var marked = require('marked');

function writeFormatted (writeFunc, val, args) {
  if (typeof val === 'string' && args) {
    args.unshift(val);
    val = format.apply(this, args);
  }
  else if (typeof val === 'object') {
    val = JSON.stringify(val);
  }

  writeFunc(val);
}

module.exports = function (info, writeFunc) {
  var out = writeFormatted.bind(this, writeFunc);

  out('<section data-filename="%s">\n', [info.filename]);
  info.comments.forEach(function (comment) {
    var tokens = comment.tokens;
    tokens.links = {};

    out('<article data-line="%d">\n', [comment.line]);
    out(marked.parser(tokens) + '\n');
    out('</article>\n');
  });
  out('</section>\n');
};
