import { LanguageSupport } from '@codemirror/language'
import { evitaQLCompletion } from './completion'
import { evitaQLLinter } from './linter'
import { evitaQLLanguage } from './evitaql'

/*
  todo
  - inline constraints
  - string escaping
 */

export function evitaQL() {
    return new LanguageSupport(
        evitaQLLanguage,
        [evitaQLCompletion, evitaQLLinter]
    )
}
