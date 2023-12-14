import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {completeFromList} from "@codemirror/autocomplete"
import {styleTags, tags as t} from "@lezer/highlight"

export const evitaQLLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Query: delimitedIndent({closing: ")", align: true}),
        HeadConstraint: delimitedIndent({closing: ")", align: true}),
        FilterConstraint: delimitedIndent({closing: ")", align: true}),
      }),
      foldNodeProp.add({
        Query: foldInside,
        HeadConstraint: foldInside,
        FilterConstraint: foldInside,
      }),
      styleTags({
        // Identifier: t.variableName,
        // Boolean: t.bool,
        // String: t.string,
        Query: t.function(t.variableName),
        HeadConstraint: t.function(t.variableName),
        FilterConstraint: t.function(t.variableName),
        Comment: t.lineComment,
        "( )": t.paren
      })
    ]
  }),
  languageData: {
    commentTokens: {line: "//"}
  }
})

export const evitaQLCompletion = evitaQLLanguage.data.of({
  autocomplete: completeFromList([
    { type: "function", label: "query" },
    { type: "function", label: "filterBy" },
    { type: "function", label: "collection" },
    { type: "function", label: "and" },
    { type: "function", label: "attributeEquals" },
    // {label: "defun", type: "keyword"},
    // {label: "defvar", type: "keyword"},
    // {label: "let", type: "keyword"},
    // {label: "cons", type: "function"},
    // {label: "car", type: "function"},
    // {label: "cdr", type: "function"}
  ])
})

export function evitaQL() {
  return new LanguageSupport(evitaQLLanguage, [evitaQLCompletion])
}
