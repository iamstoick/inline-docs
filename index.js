/*

Module entry point
====

*/


var fs = require('fs');
var gs = require('glob-stream');
var through = require('through2');
var processFile = require('./lib/process-file');
var renderHtml = require('./lib/render-as-html');
var renderMarkdown = require('./lib/render-as-markdown');

/*

Default options
----

By default we locate all .js files in the project directory, except for those in the `node_modules` directory.

*/
var defaultGlobs = [
  //> make sure README comes first
  './README.*',

  //> include common source and markdown files
  '**/*.{md,markdown}',
  '**/*.js',
  '**/*.html',
  '**/*.{css,sass,scss,less,styl}',

  //> exclude node_modules
  '!**/node_modules/**'
];

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

  var globStream = gs.create(opts.globs);

  var headings = {};
  var linkInfo = [];

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

  var processTransform = through(
    { objectMode: true },
    function onFile (file, enc, cb) {
      processFile(file.path, function (err, info) {
        if (err) { return cb(err); }
        if (!info) { return cb(); }

        //> store heading and link info so we can validate at the end
        headings[info.heading] = info.subheadings;
        linkInfo.push({
          filename: info.filename,
          links: info.links
        });

        var output = [];

        var renderer = opts.asHtml ? renderHtml : renderMarkdown;
        renderer(opts, info, function (data) {
          output.push(data);
        });

        cb(null, output.join(''));
      });
    },
    function onEnd (cb) {
      validateLinks();

      //> write the template footer
      if (templateParts) {
        this.push(templateParts[1]);
      }

      cb();
    }
  );

  globStream
    .pipe(processTransform)
    .pipe(outStream);
};
