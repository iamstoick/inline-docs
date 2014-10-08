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
