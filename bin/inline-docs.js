#!/usr/bin/env node

/*

  Command line interface
  ====

  Example:

  ```
  OUTPUT_FILE=docs.html
  TEMPLATE=../path/to/my-custom-template.html
  PROJECT_DIR=./path/to/project

  inline-docs -o $OUTPUT_FILE --template=$TEMPLATE $PROJECT_DIR
  ```

*/

var fs = require('fs');
var minimist = require('minimist');
var path = require('path');

var argv = minimist(process.argv.slice(2));

function createOutStream (path) {
  if (!path) { return null; }

  return fs.createWriteStream(path);
}

//> These options are passed into [[Module entry point]].
var opts = {
  dir: path.resolve(argv._[0] || '.'),

  //> Use the `--template` arg to choose a custom template. Template is expected to be an html file meeting the requirements in [[Template specs]].
  template: path.resolve(__dirname + '/../template/tpl.html'),

  //> Use the `-o` arg to write output to a file (default is to stdout)
  outStream: createOutStream(argv.o),

  //> Use `--markdown` to output as markdown (default is html). Setting this also disables the template.
  asHtml: !argv.markdown
};

if (argv.template) {
  //> Template can be disabled with `--template=false` if we just want to render the docs with no wrapper.
  if (argv.template === 'f' || argv.template === 'false') {
    opts.template = false;
  }
  else {
    opts.template = path.resolve(argv.template);
  }
}

if (!opts.asHtml) {
  opts.template = false;
}

require('..')(opts);
