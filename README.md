Inline Docs
====

_Embed markdown documentation in code._

[![Build Status](https://secure.travis-ci.org/joshwnj/inline-docs.png)](http://travis-ci.org/joshwnj/inline-docs)

Ideally, documentation and code are written in parallel. Good code is self-explanitory as far as the _"what"_ is concerned. Documentation is a way to record the _"why"_. Linking related parts together helps other developers understand how the system meets business needs and fits together as a whole.

Install
----

`npm install -g inline-docs`


Running from CLI
----

Run `inline-docs > docs.html` in your project's root directory. Creates docs like <http://joshwnj.github.io/inline-docs>.

See [[Command line interface]] for more options.


Running from javascript
----

See [[Module entry point]] for API details.


Getting started
----

### Writing docs

- all documentation is written in markdown format. You can do this either in a `.md` file, or embed a markdown document within the comments of a source code file.

- markdown documents will only be used if they pass some basic validation rules. See [[Validating markdown documents]] for details.


### Linking

- every level-1 and level-2 heading becomes a link anchor.
- to link to a level-1 heading use the heading text in brackets like `[[Heading text goes here]]`. This will be converted to an html hyperlink when the final docs are generated.
- linking to level-2 headings works the same, except with two parts `[[Heading text goes here][And subheading here]]`


### Refining sources

- You may come across cases where you want to exclude certain files from being parsed by `inline-docs` (eg. to avoid junk in your docs).
- To exclude a single file, add the `/* inline-docs:ignore */` directive to the top of the file.
- To exclude a set of files, override the patterns defined at [[Module entry point][Default options]].

License
----

MIT
