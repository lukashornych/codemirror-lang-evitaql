import {
    completeFromList,
    Completion,
    CompletionContext,
    CompletionResult,
    CompletionSource
} from '@codemirror/autocomplete'
import { LRLanguage, syntaxTree } from '@codemirror/language'
import { Extension } from '@codemirror/state'
import { SyntaxNode } from '@lezer/common'
// @ts-ignore
import constraints from './constraints.json'
import { ConstraintListType, EvitaQLConfig, EvitaQLConstraintListMode, EvitaQLQueryMode } from './config'

export function evitaQLCompletion(lang: LRLanguage, config: EvitaQLConfig): Extension {
    let completionList: Completion[]
    if (config.mode instanceof EvitaQLQueryMode) {
        completionList = [
            createCompletion('query', 'Query is the root construct for querying data.'),
            ...Object.keys(constraints).map(it => createCompletion(it))
        ]
    } else if (config.mode instanceof EvitaQLConstraintListMode) {
        let constraintKeys: string[]
        if (config.mode.listType === ConstraintListType.Filter) {
            constraintKeys = Object.keys(constraints).filter(it => {
                const constraint = constraints[it]
                return constraint.type === ConstraintListType.Filter && it !== 'filterBy'
            })
        } else if (config.mode.listType === ConstraintListType.Order) {
            constraintKeys = Object.keys(constraints).filter(it => {
                const constraint = constraints[it]
                return constraint.type === ConstraintListType.Order && it !== 'orderBy'
            })
        } else if (config.mode.listType === ConstraintListType.Require) {
            constraintKeys = Object.keys(constraints).filter(it => {
                const constraint = constraints[it]
                return (
                    constraint.type === ConstraintListType.Require ||
                    constraint.type === ConstraintListType.Filter || // additional filter
                    constraint.type === ConstraintListType.Order // additional order
                ) && it !== 'require'
            })
        } else {
            throw new Error(`Unsupported constraint list type '${config.mode.listType}'`)
        }

        completionList = constraintKeys.map(it => createCompletion(it))
    } else {
        throw new Error(`Unsupported mode '${config.mode?.toString()}'`)
    }

    return lang.data.of({
        autocomplete: completeFromList(completionList)
    })
}

function createCompletion(label: string, info?: string): Completion {
    const constraintDefinition: any = constraints[label]
    return {
        label,
        detail: '(...)',
        type: 'function',
        info: info ? info : constraintDefinition['shortDescription'] + "\n\n[Check detailed documentation](" + constraintDefinition['userDocsLink'] + ")",
        apply: (view, completion, from, to) => {
            view.dispatch({
                changes: { from, to, insert: label + '()' },
                selection: { anchor: from + label.length + 1 }
            })
        }
    }
}

// TODO lho possible custom solution
// function getEvitaQLCompletions(context: CompletionContext): CompletionResult | null {
//     const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
//
//     const result: CompletionResult | null = (() => {
//         let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
//         let tagBefore = /[a-zA-Z]+/.exec(textBefore)
//         if (!tagBefore && !context.explicit) {
//             return null
//         }
//
//         if (nodeBefore.name === 'Request') {
//             return getRequestCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
//         } else if (nodeBefore.name === 'QueryBody') {
//             return getQueryCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
//         } else if (nodeBefore.name === 'ConstraintBody') {
//             return getConstraintCompletions(context, nodeBefore, tagBefore as RegExpExecArray)
//         }
//
//         let parentNode = nodeBefore.parent
//         if (parentNode == null) {
//             return null
//         }
//         textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
//         tagBefore = /[a-zA-Z]+/.exec(textBefore)
//         if (!tagBefore && !context.explicit) {
//             return null
//         }
//         if (parentNode.name === 'Request') {
//             return getRequestCompletions(context, parentNode, tagBefore as RegExpExecArray)
//         } else if (parentNode.name === 'QueryBody') {
//             return getQueryCompletions(context, parentNode, tagBefore as RegExpExecArray)
//         } else if (parentNode.name === 'ConstraintBody') {
//             return getConstraintCompletions(context, parentNode, tagBefore as RegExpExecArray)
//         }
//
//         return null
//     })()
//
//     console.log(result)
//     return result
// }

// function getRequestCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
//     return {
//         from: tagBefore ? node.from + tagBefore.index : context.pos,
//         options: [
//             createCompletion('query', '`query` is the root construct for querying data.'),
//             createCompletion('query2', '`query` is the root construct for querying data.')
//         ],
//         validFor: /^(\w+)?$/
//     }
// }
// function getQueryCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
//     return {
//         from: tagBefore ? node.from + tagBefore.index : context.pos,
//         options: ['collection', 'filterBy', 'orderBy', 'require'].map(it => createCompletion(it)),
//         validFor: /^(\w+)?$/
//     }
// }
// function getConstraintCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
//     return {
//         from: tagBefore ? node.from + tagBefore.index : context.pos,
//         options: Object.keys(constraints).map(it => createCompletion(it)),
//         validFor: /^(\w+)?$/
//     }
// }