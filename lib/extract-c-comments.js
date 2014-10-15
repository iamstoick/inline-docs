var cdoc = require('cdocparser');

module.exports = function (code) {
  var extractor = new cdoc.CommentExtractor(function (match, line){
    return { type : 'testCtx', line: line };
  });

  return extractor.extract(code);
};
