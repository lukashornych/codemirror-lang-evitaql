import { LanguageSupport } from '@codemirror/language'
import { evitaQLCompletion } from './completion'
import { evitaQLLinter } from './linter'
import { evitaQLLanguage } from './evitaql'
import { EvitaQLConfig, EvitaQLQueryMode, EvitaQLConstraintListMode, ConstraintListType } from './config'

/*
  todo
  - inline constraints
  - string escaping
 */

export { evitaQLLanguage, evitaQLCompletion, evitaQLLinter, EvitaQLConfig, EvitaQLConstraintListMode, ConstraintListType }

export function evitaQL(config: EvitaQLConfig = { mode: new EvitaQLQueryMode() }) {
    const lang = evitaQLLanguage(config)
    return new LanguageSupport(
        lang,
        [evitaQLCompletion(lang, config), evitaQLLinter]
    )
}
