/**

  Exclude pre-heading markdown tokens
  ====

  Every doc is expected to begin with a level-1 heading, so anything  before this is ignored.

  It's common to see metadata comments near the top of a file which we wouldn't want to include. Also, expecting a level-1 markdown heading gives the developer a natural way to opt-in so we're not creating nonsense-documentatation for files that weren't intended to use comments in this way.

*/

/**

  Determine whether a token is a Level-1 Heading
  ----

  Inputs:
  - MarkdownToken

  Output: boolean

*/
function isLevel1Heading (token) {
  return token.type === 'heading' && token.depth === 1;
}

/**

  Module interface
  ----

  Inputs:
  - DocItem[]

  Output: DocItem[]

*/
module.exports = function (items) {
  var item;
  var token;
  while (items.length) {
    item = items[0];

    while (item.tokens.length) {
      token = item.tokens[0];
      if (isLevel1Heading(token)) { break; }
      else { item.tokens.shift(); }
    }

    // found a level-1 heading
    if (item.tokens.length) {
      break;
    }
    // exhausted all tokens, so ignore this comment entirely
    else {
      items.shift();
    }
  }

  return items;
};
