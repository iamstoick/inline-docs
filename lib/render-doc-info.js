/**

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
var path = require('path');
var getHeadingId = require('./get-heading-id');
var extractLinks = require('./extract-links');

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

/**

  Rendering a document link
  ----

  This is used as the `replaceFunc` arg in [[Extract Document Links][Replace Links]].

  Inputs:
  - link parts: eg. `[Section, Subsection]`

  Output: HtmlString

*/
function renderLink (parts) {
  var anchor = parts.map(getHeadingId).join(':');
  var text = parts.length === 1 ?
      parts[0] :
      format('%s&rarr;%s', parts[0], parts[1]);

  return format('<a class="doc-link" href="#%s">%s</a>', anchor, text);
}

/**

  Replacing document link placeholders with hyperlinks
  ----

  See also: [[Extract Document Links][Replace Links]].

  Inputs:
  - HtmlString

  Output: HtmlString

*/
function insertDocLinks (html) {
  return extractLinks.replace(html, renderLink);
}

module.exports = function (opts, info, writeFunc) {
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

  var filename = info.filename.replace(opts.dir, '');

  //> assume the rendered documentation is in the root directory of the repo
  var fileUrl = './' + filename.replace(/^\//, '');

  out('<section data-filename="%s">\n', [filename]);
  info.items.forEach(function (item) {
    var tokens = item.tokens;
    tokens.links = {};

    var html = parser.parse(tokens);
    html = insertDocLinks(html);

    out('<article data-line="%d">\n', [item.line]);
    out(html + '\n');

    //> display a reference to the source code this comment comes from.
    out('<div class="source-ref">Source: <a href="%s#L%d">%s, line %d</a></div>', [
      fileUrl,
      item.line,
      filename,
      item.line
    ]);
    out('</article>\n');
  });
  out('</section>\n');
};
