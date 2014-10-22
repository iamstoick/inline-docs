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
var Readable = require('readable-stream');
var through = require('through');
var processFile = require('./lib/process-file');
var renderDocInfo = require('./lib/render-doc-info');

/*

Default options
----

By default we locate all .js files in the project directory, except for those in the `node_modules` directory.

*/
var defaultGlobs = [
  //> include common source and markdown files
  '**/*.js',
  '**/*.html',
  '**/*.css',
  '**/*.{md,markdown}',

  //> exclude node_modules
  '!**/node_modules/**'
];

function findAndProcessAll (finder, opts) {
  var stream = new Readable({
    objectMode: true,
    highWaterMark: 16
  });

  stream._read = function () {};

  finder.on('file', function (filename, stat) {
    if (minimatchAll(filename, opts.globs)) {
      processFile(filename, function (err, info) {
        if (err) { throw err; }
        if (!info) { return; }

        stream.push(info);
      });
    }
  });

  finder.on('end', function () {
    stream.push(null);
  });

  return stream;
}

module.exports = function (opts) {
  if (!opts) { opts = {}; }

  if (!opts.globs) {
    opts.globs = defaultGlobs;
  }

  if (!opts.dir) {
    opts.dir = process.cwd();
  }

  var finder = findit(opts.dir);
  var headings = {};
  var linkInfo = [];
  var render = function (info) {
    //> store heading and link info so we can validate at the end
    headings[info.heading] = info.subheadings;
    linkInfo.push({
      filename: info.filename,
      links: info.links
    });

    var writeFunc = this.queue.bind(this);
    renderDocInfo(opts, info, writeFunc);
  };

  var validateLinks = function () {
    linkInfo.forEach(function (info) {
      info.links.forEach(function (link) {
        var section = headings[link[0]];
        if (!section) {
          return console.error('- Bad link to [[%s]] (%s)', link[0], info.filename);
        }

        if (link.length === 1) { return; }

        if (section.indexOf(link[1]) === -1) {
          return console.error('- Bad link to [[%s]] (%s)', link.join(']['), info.filename);
        }
      });
    });
  };

  var template;
  var templateParts;
  if (opts.template) {
    template = fs.readFileSync(opts.template, 'utf8');
    templateParts = template.split('{{ content }}');

    //> prepend a directive so that the generated file is *not* included the next time we run `inline-docs`
    process.stdout.write('<!--\n/* inline-docs:ignore */\n-->');

    //> write the template header
    process.stdout.write(templateParts[0]);
  }

  findAndProcessAll(finder, opts)
    .pipe(through(render, function () {
      validateLinks();

      //> write the template footer
      if (templateParts) {
        this.queue(templateParts[1]);
      }

      this.queue(null);
    }))
    .pipe(process.stdout);
};
