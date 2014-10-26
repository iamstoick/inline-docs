/*

Extract Document Links
====

- linking to a level-1 heading: `[[Overview]]`.  Renders as [Overview](#overview).
- linking to a level-2 heading: `[[Overview][How are docs generated?]]`. Renders as [Overview&rarr;How are docs generated?](#overview:how-are-docs-generated-)
- `[[.][How are docs generated?]]` is a relative link to a level-2 heading within the current level-1 section. Renders as [&rarr;How are docs generated?](#overview:how-are-docs-generated-)

*/

//> pattern that we use to match links
var linkRule = /([^`])\[\[(\w.+?)\]\]/g;

//> split level-1 and level-2 parts
function getParts (raw) {
  return raw.split('][');
}

function extractLinks (text) {
  var links = [];
  var match;
  while ((match = linkRule.exec(text)) !== null) {
    links.push(getParts(match[2]));
  }

  return links;
}

/*

Replace Links
----

Rewrite doclinks in-place.

Inputs:
- text: string
- replaceFunc: function, will be called with the link parts, and the return value will be used in place of the doclink. Eg. `replaceFunc(['Section', 'Subsection'])`

Output: string

*/
function replace (text, replaceFunc) {
  var output = [];
  var lastPos = 0;
  var match;
  while ((match = linkRule.exec(text)) !== null) {
    output.push(text.substring(lastPos, match.index));

    // always pass through the prefix untouched
    output.push(match[1]);

    // do a replacement on the link parts
    output.push(replaceFunc(getParts(match[2])));

    // update the cursor
    lastPos = linkRule.lastIndex;
  }

  // add remainder
  if (lastPos < text.length) {
    output.push(text.substr(lastPos));
  }

  return output.join('');
}

module.exports = extractLinks;
module.exports.replace = replace;
module.exports.linkRule = linkRule;
