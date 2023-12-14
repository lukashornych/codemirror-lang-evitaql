import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {completeFromList} from "@codemirror/autocomplete"
import {styleTags, tags as t} from "@lezer/highlight"

export const evitaQLLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Identifier: t.variableName,
        Boolean: t.bool,
        String: t.string,
        LineComment: t.lineComment,
        "( )": t.paren
      })
    ]
  }),
  languageData: {
    commentTokens: {line: ";"}
  }
})

export const evitaQLCompletion = evitaQLLanguage.data.of({
  autocomplete: completeFromList([
    {label: "defun", type: "keyword"},
    {label: "defvar", type: "keyword"},
    {label: "let", type: "keyword"},
    {label: "cons", type: "function"},
    {label: "car", type: "function"},
    {label: "cdr", type: "function"}
  ])
})

export function evitaQL() {
  return new LanguageSupport(evitaQLLanguage, [evitaQLCompletion])
}
