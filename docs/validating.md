Validating markdown documents
====

- To be considered valid, a source file must have exactly one level-1 heading in the markdown portion.
- Any comments before the level-1 heading are ignored.
- Block-level comments are only included if they begin with 2 asterisks (eg. `/** ... */`)
- Single-line comments are only included if they begin with a `///>` (eg. `///> comment goes here...`)
