import { completeFromList, Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { SyntaxNode } from '@lezer/common'
// @ts-ignore
import constraints from './constraints.json'
import { evitaQLLanguage } from './evitaql'

export const evitaQLCompletion = evitaQLLanguage.data.of({
    // autocomplete: getEvitaQLCompletions
    autocomplete: completeFromList([
        createCompletion('query', '`query` is the root construct for querying data.'),
        ...Object.keys(constraints).map(it => createCompletion(it))
    ])
})

function getEvitaQLCompletions(context: CompletionContext): CompletionResult | null {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
    console.log(nodeBefore)

    const result: CompletionResult | null = (() => {
        let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
        let tagBefore = /[a-zA-Z]+/.exec(textBefore)
        console.log(textBefore)
        console.log(tagBefore)
        if (!tagBefore && !context.explicit) {
            console.log('no tag before')
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
        textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
        tagBefore = /[a-zA-Z]+/.exec(textBefore)
        if (!tagBefore && !context.explicit) {
            console.log('no tag before parent')
            return null
        }
        console.log(textBefore)
        console.log(tagBefore)
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
            createCompletion('query', '`query` is the root construct for querying data.'),
            createCompletion('query2', '`query` is the root construct for querying data.')
        ],
        validFor: /^(\w+)?$/
    }
}
function getQueryCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
    return {
        from: tagBefore ? node.from + tagBefore.index : context.pos,
        options: ['collection', 'filterBy', 'orderBy', 'require'].map(it => createCompletion(it)),
        validFor: /^(\w+)?$/
    }
}
function getConstraintCompletions(context: CompletionContext, node: SyntaxNode, tagBefore: RegExpExecArray): CompletionResult {
    return {
        from: tagBefore ? node.from + tagBefore.index : context.pos,
        options: Object.keys(constraints).map(it => createCompletion(it)),
        validFor: /^(\w+)?$/
    }
}

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