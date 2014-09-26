/*

Inline Docs
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
- linking to a level-1 heading: [[Docs]].  Renders as [Docs](./docs.md).
- linking to a level-2 heading: [[Docs/How are docs generated?]]. Renders as [How are docs generated? (Docs)](./docs.md#how-are-docs-generated)
- [[./How are docs generated?]] is a relative link to a level-2 heading within the current level-1 section. Renders as [How are docs generated?](./docs.md#how-are-docs-generated)


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
var path = require('path');
var minimatchAll = require('minimatch-all');
var processFile = require('./lib/process-file');

var dir = __dirname;
var finder = findit(dir);

var opts = {
  globs: [
    // match .js and .md files
    '**/*.js',
    //'**/*.md',

    // exclude node_modules
    '!**/node_modules/**',

    // include lib
    '**/node_modules/lib/**'
  ]
};

var docs = [];

finder.on('file', function (filename, stat) {
  if (minimatchAll(filename, opts.globs)) {
    processFile(filename, function (err, info) {
      if (err) { throw err; }
      if (!info) { return; }

      docs.push(info);
    });
  }
});

finder.on('end', function () {
  process.stdout.write(JSON.stringify(docs) + '\n');
});
