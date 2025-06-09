import { LanguageSupport, LRLanguage } from '@codemirror/language'
import { evitaQLCompletion } from './completion'
import { evitaQLLinter } from './linter'
import { evitaQLConstraintListLanguage, evitaQLQueryLanguage } from './evitaql'
import { ConstraintListType, EvitaQLConfig, EvitaQLConstraintListMode, EvitaQLQueryMode } from './config'

/*
  todo
  - inline constraints
  - string escaping
 */

export { evitaQLQueryLanguage, evitaQLConstraintListLanguage, evitaQLCompletion, evitaQLLinter, EvitaQLConfig, EvitaQLQueryMode, EvitaQLConstraintListMode, ConstraintListType }

export function evitaQL(config: EvitaQLConfig = { mode: new EvitaQLQueryMode() }) {
    let language: LRLanguage
    if (config.mode instanceof EvitaQLQueryMode) {
        language = evitaQLQueryLanguage
    } else if (config.mode instanceof EvitaQLConstraintListMode) {
        language = evitaQLConstraintListLanguage
    } else {
        throw new Error(`Unsupported mode '${config.mode?.toString()}'`)
    }

    return new LanguageSupport(
        language,
        [evitaQLCompletion(language, config), evitaQLLinter]
    )
}
