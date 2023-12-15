import { Diagnostic, linter } from '@codemirror/lint'
import { syntaxTree } from '@codemirror/language'

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