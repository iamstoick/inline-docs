/*

  Rendering the document as markdown
  ====

  - extra info (eg. source references) are rendered as code blocks

*/

var format = require('util').format;
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

/*

  Rendering a document link
  ----

  This is used as the `replaceFunc` arg in [[Extract Document Links][Replace Links]].

*/
function renderLink (parts) {
  var anchor = parts.map(getHeadingId).join(':');
  var text = parts.length === 1 ?
      parts[0] :
      format('%s: %s', parts[0], parts[1]);

  return format('[%s](#%s)', text, anchor);
}

/*

  Replacing document link placeholders with hyperlinks
  ----

  See also: [[Extract Document Links][Replace Links]].

*/
function insertDocLinks (html) {
  return extractLinks.replace(html, renderLink);
}

module.exports = function (opts, info, writeFunc) {
  var out = writeFormatted.bind(this, writeFunc);

  var sectionId = getHeadingId(info.heading);
  var filename = info.filename.replace(opts.dir, '');

  //> assume the rendered documentation is in the root directory of the repo
  var fileUrl = './' + filename.replace(/^\//, '');

  var items = info.items.filter(function (item) {
    return !!item.raw;
  });

  if (!items.length) { return; }

  items.forEach(function (item) {
    //> replace doc-link placeholders with html anchor links
    var value = extractLinks.replace(item.raw, renderLink);

    out(value + '\n');

    //> display a reference to the source code this comment comes from.
    out('\n[Source: %s, line %d](%s#L%d)\n\n', [
      filename,
      item.line,
      fileUrl,
      item.line
    ]);
  });
};
