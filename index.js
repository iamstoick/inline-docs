/*

Module entry point
====

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

  //> Either write to a file, or to stdout
  var outStream = opts.outStream || process.stdout;

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
    outStream.write('<!--\n/* inline-docs:ignore */\n-->');

    //> write the template header
    outStream.write(templateParts[0]);
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
    .pipe(outStream);
};
