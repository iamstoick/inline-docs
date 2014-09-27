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
var getHeadingId = require('./get-heading-id');

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

/*

Rendering a document link
----

Inputs:
- DocLink

Output: HtmlString

*/
function renderLink (raw) {
  //> split level-1 and level-2 parts
  var parts = raw.split('][');
  var anchor = parts.map(getHeadingId).join(':');
  var text = parts.length === 1 ?
      parts[0] :
      format('%s&rarr;%s', parts[0], parts[1]);

  return format('<a class="doc-link" href="#%s">%s</a>', anchor, text);
}

/*

Replacing document link placeholders with hyperlinks
----

Inputs:
- HtmlString

Output: HtmlString

*/
function insertDocLinks (html) {
  //> placeholders with a preceding backtick are ignored.
  var linkRule = /([^`])\[\[(\w.+?)\]\]/g;

  return html.replace(linkRule, function (match, prefix, inner) {
    return prefix + renderLink(inner);
  });
}

module.exports = function (info, writeFunc) {
  var out = writeFormatted.bind(this, writeFunc);

  var sectionId = getHeadingId(info.heading);
  var renderer = new marked.Renderer();
  renderer.heading = function (text, level) {
    var id;
    if (level === 1) {
      id = sectionId;
    }
    else if (level === 2) {
      id = sectionId + ':' + getHeadingId(text);
    }

    return format('<h%d id="%s">%s</h%d>', level, id, text, level);
  };

  var parser = new marked.Parser({
    renderer: renderer
  });

  out('<section data-filename="%s">\n', [info.filename]);
  info.comments.forEach(function (comment) {
    var tokens = comment.tokens;
    tokens.links = {};

    var html = parser.parse(tokens);
    html = insertDocLinks(html);

    out('<article data-line="%d">\n', [comment.line]);
    out(html + '\n');
    out('</article>\n');
  });
  out('</section>\n');
};
