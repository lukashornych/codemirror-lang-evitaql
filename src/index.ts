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
import { completeFromList, Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
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

function createCompletion(label: string, info?: string): Completion {
    return {
        label: label + '(...)',
        type: 'function',
        info,
        apply: (view, completion, from, to) => {
            view.dispatch({
                changes: { from, to, insert: label + '()' },
                selection: { anchor: from + label.length + 1 }
            })
        }
    }
}

// todo
function getEvitaQLCompletions(context: CompletionContext): CompletionResult | null {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
    const parentNode = nodeBefore.parent
    console.log(nodeBefore)
    if (parentNode == null) {
        return null
    }

    if (parentNode.name === 'Request') {
        return {
            from: nodeBefore.from,
            options: [
                createCompletion('query', '`query` is the root construct for querying data.')
            ]
        }
    }
    if (parentNode.name === 'Query') {
        return {
            from: nodeBefore.from,
            options: ['collection', 'filterBy', 'orderBy', 'require'].map(it => createCompletion(it))
        }
    }
    if (parentNode.name === 'HeadConstraint') {
        return {
            from: nodeBefore.from,
            options: []
        }
    }
    if (parentNode.name === 'FilterConstraint') {
        return {
            from: nodeBefore.from,
            options: ['and', 'or', 'not', 'attributeEquals'].map(it => createCompletion(it))
        }
    }

    return null
}

export const evitaQLCompletion = evitaQLLanguage.data.of({
    autocomplete: getEvitaQLCompletions
    // autocomplete: completeFromList([
    //     'query',
    //
    //     'collection',
    //
    //     'filterBy',
    //     'filterGroupBy',
    //     'and',
    //     'or',
    //     'not',
    //     'userFilter',
    //     'attributeEquals',
    //     'attributeGreaterThan',
    //     'attributeGreaterThanEquals',
    //     'attributeLessThan',
    //     'attributeLessThanEquals',
    //     'attributeBetween',
    //     'attributeInSet',
    //     'attributeContains',
    //     'attributeStartsWith',
    //     'attributeEndsWith',
    //     'attributeEqualsTrue',
    //     'attributeEqualsFalse',
    //     'attributeIs',
    //     'attributeIsNull',
    //     'attributeIsNotNull',
    //     'attributeInRange',
    //     'attributeInRangeNow',
    //     'entityPrimaryKeyInSet',
    //     'entityLocaleEquals',
    //     'priceInCurrency',
    //     'priceInPriceLists',
    //     'priceValidInNow',
    //     'priceValidIn',
    //     'priceBetween',
    //     'facetHaving',
    //     'referenceHaving',
    //     'hierarchyWithin',
    //     'hierarchyWithinSelf',
    //     'hierarchyWithinRoot',
    //     'hierarchyWithinRootSelf',
    //     'directRelation',
    //     'having',
    //     'excludingRoot',
    //     'excluding',
    //     'entityHaving',
    //
    //     'orderBy',
    //     'orderGroupBy',
    //     'attributeNatural',
    //     'attributeSetExact',
    //     'attributeSetInFilter',
    //     'priceNatural',
    //     'random',
    //     'referenceProperty',
    //     'entityPrimaryKeyNatural',
    //     'entityPrimaryKeyExact',
    //     'entityPrimaryKeyInFilter',
    //     'entityProperty',
    //     'entityGroupProperty',
    //
    //     'require',
    //     'page',
    //     'strip',
    //     'entityFetch',
    //     'entityGroupFetch',
    //     'attributeContent',
    //     'attributeContentAll',
    //     'priceContent',
    //     'priceContentAll',
    //     'priceContentRespectingFilter',
    //     'associatedDataContent',
    //     'associatedDataContentAll',
    //     'referenceContentAll',
    //     'referenceContent',
    //     'referenceContentAllWithAttributes',
    //     'referenceContentWithAttributes',
    //     'hierarchyContent',
    //     'priceType',
    //     'dataInLocalesAll',
    //     'dataInLocales',
    //     'facetSummary',
    //     'facetSummaryOfReference',
    //     'facetGroupsConjunction',
    //     'facetGroupsDisjunction',
    //     'facetGroupsNegation',
    //     'attributeHistogram',
    //     'priceHistogram',
    //     'distance',
    //     'level',
    //     'node',
    //     'stopAt',
    //     'statistics',
    //     'fromRoot',
    //     'children',
    //     'siblings',
    //     'parents',
    //     'hierarchyOfSelf',
    //     'hierarchyOfReference',
    //     'queryTelemetry'
    // ].map(constraint => ({ label: constraint, type: 'function' })))
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
