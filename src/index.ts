import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import { completeFromList, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
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
        String: t.string,
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

function getEvitaQLCompletions(context: CompletionContext): CompletionResult | null {
  let word = context.matchBefore(/\(/)
  if (word == null || (word.from == word.to && !context.explicit)) {
    return null
  }
  if (word.text === "filterBy") {
    return {
      from: word.from,
      options:  [
        { type: "function", label: "and" },
        { type: "function", label: "attributeEquals" }
      ]
    }
  }
  return {
    from: word.from,
    options: []
  }
}

export const evitaQLCompletion = evitaQLLanguage.data.of({
  autocomplete: getEvitaQLCompletions
})

export function evitaQL() {
  return new LanguageSupport(evitaQLLanguage, [evitaQLCompletion])
}
