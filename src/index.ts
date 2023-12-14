import { parser } from './syntax.grammar'
import {
    LRLanguage,
    LanguageSupport,
    indentNodeProp,
    foldNodeProp,
    foldInside,
    delimitedIndent,
    syntaxTree
} from '@codemirror/language'
import { completeFromList, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { styleTags, tags as t } from '@lezer/highlight'
import { Diagnostic, linter } from '@codemirror/lint'

/*
  todo
  - pos/named parameters
  - complex autocomplete
  - syntax highlighting
  - value types
  - all constraints
  - documentation
  - tests
  - inline constraints
  - string escaping
 */

export const evitaQLLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Query: delimitedIndent({ closing: ')', align: true }),
                HeadConstraint: delimitedIndent({ closing: ')', align: true }),
                FilterConstraint: delimitedIndent({ closing: ')', align: true }),
                Range: delimitedIndent({ closing: ']', align: true })
            }),
            // todo this is not working
            // foldNodeProp.add({
            //   Query: foldInside,
            //   HeadConstraint: foldInside,
            //   FilterConstraint: foldInside,
            // }),
            styleTags({
                String: t.string,
                Int: t.integer,
                Float: t.float,
                Boolean: t.bool,
                Date: t.literal,
                Time: t.literal,
                DateTime: t.literal,
                OffsetDateTime: t.literal,
                Uuid: t.literal,
                Enum: t.constant(t.variableName),
                Query: t.function(t.variableName),
                HeadConstraint: t.function(t.variableName),
                FilterConstraint: t.function(t.variableName),
                Comment: t.lineComment,
                ',': t.separator,
                '( )': t.paren,
                '[ ]': t.squareBracket
            })
        ]
    }),
    languageData: {
        commentTokens: { line: '//' }
    }
})

// todo
function getEvitaQLCompletions(context: CompletionContext): CompletionResult | null {
    // let word = context.matchBefore(/\(/)
    // if (word == null || (word.from == word.to && !context.explicit)) {
    //   return null
    // }
    // console.log(word)
    // if (word.text === "filterBy") {
    //   return {
    //     from: word.from,
    //     options:  [
    //       { type: "function", label: "and" },
    //       { type: "function", label: "attributeEquals" }
    //     ]
    //   }
    // }
    // return {
    //   from: word.from,
    //   options: []
    // }


    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
    const parentNode = nodeBefore.parent
    if (parentNode == null) {
        return null
    }

    if (parentNode.name === 'Request') {
        return {
            from: context.pos,
            options: [
                { label: 'query', type: 'function' }
            ]
        }
    }
    if (parentNode.name === 'Query') {
        return {
            from: context.pos,
            options: [
                { label: 'collection', type: 'function' },
                { label: 'filterBy', type: 'function' },
                { label: 'orderBy', type: 'function' },
                { label: 'require', type: 'function' },
            ]
        }
    }
    if (parentNode.name === 'HeadConstraint') {
        return {
            from: context.pos,
            options: [
                { label: 'collection', type: 'function' }
            ]
        }
    }
    if (parentNode.name === 'FilterConstraint') {
        return {
            from: context.pos,
            options: [
                { label: 'and', type: 'function' },
                { label: 'attributeEquals', type: 'function' },
            ]
        }
    }

    // if (nodeName === 'Query') {
    //     const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
    //     const tagBefore = /query\($/.exec(textBefore)
    //     if (!tagBefore && !context.explicit) return null
    //     return {
    //         from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
    //         options: [
    //             { label: 'filterBy', type: 'function' }
    //         ],
    //         validFor: /^(query\()?$/
    //     }
    // }

    return null
}

export const evitaQLCompletion = evitaQLLanguage.data.of({
    autocomplete: completeFromList([
        'query',

        'collection',

        'filterBy',
        'filterGroupBy',
        'and',
        'or',
        'not',
        'userFilter',
        'attributeEquals',
        'attributeGreaterThan',
        'attributeGreaterThanEquals',
        'attributeLessThan',
        'attributeLessThanEquals',
        'attributeBetween',
        'attributeInSet',
        'attributeContains',
        'attributeStartsWith',
        'attributeEndsWith',
        'attributeEqualsTrue',
        'attributeEqualsFalse',
        'attributeIs',
        'attributeIsNull',
        'attributeIsNotNull',
        'attributeInRange',
        'attributeInRangeNow',
        'entityPrimaryKeyInSet',
        'entityLocaleEquals',
        'priceInCurrency',
        'priceInPriceLists',
        'priceValidInNow',
        'priceValidIn',
        'priceBetween',
        'facetHaving',
        'referenceHaving',
        'hierarchyWithin',
        'hierarchyWithinSelf',
        'hierarchyWithinRoot',
        'hierarchyWithinRootSelf',
        'directRelation',
        'having',
        'excludingRoot',
        'excluding',
        'entityHaving',

        'orderBy',
        'orderGroupBy',
        'attributeNatural',
        'attributeSetExact',
        'attributeSetInFilter',
        'priceNatural',
        'random',
        'referenceProperty',
        'entityPrimaryKeyNatural',
        'entityPrimaryKeyExact',
        'entityPrimaryKeyInFilter',
        'entityProperty',
        'entityGroupProperty',

        'require',
        'page',
        'strip',
        'entityFetch',
        'entityGroupFetch',
        'attributeContent',
        'attributeContentAll',
        'priceContent',
        'priceContentAll',
        'priceContentRespectingFilter',
        'associatedDataContent',
        'associatedDataContentAll',
        'referenceContentAll',
        'referenceContent',
        'referenceContentAllWithAttributes',
        'referenceContentWithAttributes',
        'hierarchyContent',
        'priceType',
        'dataInLocalesAll',
        'dataInLocales',
        'facetSummary',
        'facetSummaryOfReference',
        'facetGroupsConjunction',
        'facetGroupsDisjunction',
        'facetGroupsNegation',
        'attributeHistogram',
        'priceHistogram',
        'distance',
        'level',
        'node',
        'stopAt',
        'statistics',
        'fromRoot',
        'children',
        'siblings',
        'parents',
        'hierarchyOfSelf',
        'hierarchyOfReference',
        'queryTelemetry'
    ].map(constraint => ({ label: constraint, type: 'function' })))
})

export const evitaQLLinter = linter(view => {
    const diagnostics: Diagnostic[] = []

    syntaxTree(view.state).cursor().iterate(node => {
        if (node.type.isError) {
            console.log(node)
            diagnostics.push({
                from: node.from,
                to: node.to,
                severity: 'error',
                message: 'Syntax error.'
            })
        }
    })

    return diagnostics
})

export function evitaQL() {
    return new LanguageSupport(evitaQLLanguage, [evitaQLCompletion, evitaQLLinter])
}
