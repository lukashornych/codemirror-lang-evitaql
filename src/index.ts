import { parser } from './syntax.grammar'
import {
    LRLanguage,
    LanguageSupport,
    indentNodeProp,
    foldNodeProp,
    foldInside,
    delimitedIndent,
    syntaxTree, continuedIndent
} from '@codemirror/language'
import { completeFromList, Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { styleTags, tags as t } from '@lezer/highlight'
import { SyntaxNode } from '@lezer/common'
import { Diagnostic, linter } from '@codemirror/lint'
import constraints from './constraints.json'

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
                "QueryBody ConstraintBody": delimitedIndent({ closing: ')', align: true }),
                Range: delimitedIndent({ closing: ']', align: true })
            }),
            foldNodeProp.add({
                'QueryBody ConstraintBody': foldInside
            }),
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
                RootConstraint: t.function(t.variableName),
                Constraint: t.function(t.variableName),
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
    const constraintDefinition: any = constraints[label]
    return {
        label,
        detail: '(...)',
        type: 'function',
        info: info ? info : constraintDefinition['shortDescription'] + "\n\n" + constraintDefinition['userDocsLink'],
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
    console.log(nodeBefore)

    const result: CompletionResult | null = (() => {
        const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
        const tagBefore = /\w+/.exec(textBefore)
        if (!tagBefore && !context.explicit) {
            return null
        }

        if (nodeBefore.name === 'Request') {
            return getRequestCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
        } else if (nodeBefore.name === 'QueryBody') {
            return getQueryCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
        } else if (nodeBefore.name === 'ConstraintBody') {
            return getConstraintCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
        }

        let parentNode = nodeBefore.parent
        if (parentNode == null) {
            return null
        }
        if (parentNode.name === 'Request') {
            return getRequestCompletions(context, parentNode, tagBefore as RegExpExecArray)
        } else if (parentNode.name === 'QueryBody') {
            return getQueryCompletions(context, parentNode, tagBefore as RegExpExecArray)
        } else if (parentNode.name === 'ConstraintBody') {
            return getConstraintCompletions(context, parentNode, tagBefore as RegExpExecArray)
        }

        return null
    })()

    console.log(result)
    return result
}

function getRequestCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
    return {
        from: tagBefore ? node.from + tagBefore.index : context.pos,
        options: [
            createCompletion('query', '`query` is the root construct for querying data.')
        ]
    }
}
function getQueryCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
    return {
        from: tagBefore ? node.from + tagBefore.index : context.pos,
        options: ['collection', 'filterBy', 'orderBy', 'require'].map(it => createCompletion(it))
    }
}
function getConstraintCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
    return {
        from: tagBefore ? node.from + tagBefore.index : context.pos,
        options: ['and', 'or', 'not', 'attributeEquals'].map(it => createCompletion(it))
    }
}

export const evitaQLCompletion = evitaQLLanguage.data.of({
    autocomplete: getEvitaQLCompletions
    /*autocomplete: completeFromList([
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
    ].map(constraint => ({ label: constraint, type: 'function' })))*/
})

export const evitaQLLinter = linter(view => {
    const diagnostics: Diagnostic[] = []

    syntaxTree(view.state).cursor().iterate(node => {
        if (node.type.isError) {
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
