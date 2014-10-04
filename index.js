/*

Overview
====

How are docs generated?
----

- source files are parsed to extract comments, which are combined to form a markdown document.
- markdown document must have exactly one level-1 heading to be considered valid.
- any comments preceding the first level-1 heading are ignored.
- the text of the level-1 heading is used for identity, so must be unique across all docs.


Links
----

- every level-1 and level-2 heading becomes a link anchor.
- see also: [[Process a file][Find document links in comments]].

Source references
----

- when extracting comments from a source file we also get the line number it came from.
- in the generated output we can include a reference back to the location in the source file.


Extracting comments
----

- for each file we get a list of comments.
- for each comment we get a list of markdown tokens and location info.
- drop all tokens preceding the level-1 heading.

*/

var findit = require('findit');
var fs = require('fs');
var path = require('path');
var minimatchAll = require('minimatch-all');
var processFile = require('./lib/process-file');
var renderDocInfo = require('./lib/render-doc-info');

/*

Default options
----

By default we locate all .js files in the project directory, except for those in the `node_modules` directory.

*/
var defaultGlobs = [
  //> include js and markdown files
  '**/*.js',
  '**/*.{md,markdown}',

  //> exclude node_modules
  '!**/node_modules/**'
];

var writeToStdout = true;
var writeFunc = writeToStdout ?
    process.stdout.write.bind(process.stdout) :
    function () {};

function findAndProcessAll (finder, opts, callback) {
  finder.on('file', function (filename, stat) {
    if (minimatchAll(filename, opts.globs)) {
      processFile(filename, function (err, info) {
        if (err) { throw err; }
        if (!info) { return; }

        renderDocInfo(opts, info, writeFunc);
      });
    }
  });

  finder.on('end', function () {
    callback();
  });
}

module.exports = function (opts) {
  if (!opts) { opts = {}; }

  if (!opts.globs) {
    opts.globs = defaultGlobs;
  }

  if (!opts.template) {
    opts.template = __dirname + '/template/tpl.html';
  }

  if (!opts.dir) {
    opts.dir = process.cwd();
  }

  if (!opts.baseRepoUrl) {
    var packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync(opts.dir + '/package.json', 'utf8'));
      opts.baseRepoUrl = packageJson.repository.url.replace('.git', '');
    }
    catch (e) {}
  }

  var finder = findit(opts.dir);
  var template = fs.readFileSync(opts.template, 'utf8');
  var parts = template.split('{{ content }}');

  writeFunc(parts[0]);
  findAndProcessAll(finder, opts, function (err) {
    writeFunc(parts[1]);
  });
};
