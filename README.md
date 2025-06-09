# evitaQL language support for CodeMirror 6

This repository contains plugin for CodeMirror 6 that adds for evitaQL query language used by [evitaDB](https://evitadb.io/documentation/query/basics)
database.

## Development

### Testing

```shell
yarn test
```

### Publishing

```shell
yarn prepare
yarn publish --access private
```

### Adding new constraints

The constraints support is constructed from the `src/constraints.json` (contains constraint definition and documentation)
and from the `src/syntax.grammar` (actual constraints grammar for syntax highlighting and validating).

Firstly, export constraint definition using [evitaDB's](https://github.com/FgForrest/evitaDB) `io.evitadb.documentation.JavaDocCopy#exportConstraintDefinitions` 
special JUnit test. Replace the `src/constraints.json` with the generated JSON file.
Then add all new constraints from [evitaDB's](https://github.com/FgForrest/evitaDB) `io.evitadb.api.query.QueryConstraints`
into the `src/syntax.grammar` file.