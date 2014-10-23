/*

  Creating heading anchors
  ====

  Each level-1 and level-2 heading can be linked to. We create a unique anchor ID by converting the heading text into a suitable format.

*/
module.exports = function getHeadingId (raw) {
  return raw.toLowerCase().replace(/[^\w]+/g, '-');
};
