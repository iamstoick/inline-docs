Inline Docs
====

[![Build Status](https://secure.travis-ci.org/joshwnj/inline-docs.png)](http://travis-ci.org/joshwnj/inline-docs)

Embed markdown documentation in code.


Install
----

`npm install -g inline-docs`


Usage
----

Run `inline-docs . > docs.html` in your project's root directory.

For an example of output you can view the docs for this repo: <http://joshwnj.github.io/inline-docs>

Rules
----

- To be considered valid, a source file must have exactly one level-1 heading in the markdown portion.
- Any comments before the level-1 heading are ignored.
- Block-level comments are only included if they begin with 2 asterisks (eg. `/** ... */`)
- Single-line comments are only included if they begin with a `///>` (eg. `///> comment goes here...`)


Project goals
----

There are many existing tools to help you generate documentation from code, but most of them are geared towards describing APIs. Put more generally, the tools and documentation are focussed on _what_ the code is doing and _how_ to properly call each function. This is useful, but a lot of the time we need to document _why_ things were done in a certain way. Every design-decision and tradeoff made today impacts the possible decisions that can be made tomorrow, and this information is critical to new developers becoming involved in the project.

Along with this, `inline-docs` has the following goals:

- There should be _a simple standard to follow when documenting code_.
- Considering that one part of the codebase often only makes sense in the context of the whole, there should be _a natural way to make connections across a codebase_. Reading the docs should be like having a guided tour of the code.
- The tool should encourage _documenting as a primary development task_.


License
----

MIT
