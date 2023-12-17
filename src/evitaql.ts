import { delimitedIndent, foldInside, foldNodeProp, indentNodeProp, LRLanguage } from '@codemirror/language'
import { parser } from './syntax.grammar'
import { styleTags, tags as t } from '@lezer/highlight'
import { EvitaQLConfig, EvitaQLConstraintListMode, EvitaQLQueryMode } from './config'

export function evitaQLLanguage(config: EvitaQLConfig): LRLanguage {
    let top: string
    if (config.mode instanceof EvitaQLQueryMode) {
        top = 'QueryRequest'
    } else if (config.mode instanceof EvitaQLConstraintListMode) {
        top = 'ConstraintRequest'
    } else {
        throw new Error(`Unsupported mode '${config.mode?.toString()}'`)
    }

    return LRLanguage.define({
        parser: parser.configure({
            top,
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
}