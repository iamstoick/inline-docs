// tell if a markdown token is a heading of a certain level (h1, h2, etc)
module.exports = function isHeading (level, token) {
  return token.type === 'heading' && token.depth === level;
};
