import { TextDocument, Position, Range, ExtensionContext, workspace } from 'vscode'
import { Global } from './Global'
import { RewriteKeyContext } from './types'
import { Config } from './Config'
import { Loader } from './loaders/Loader'
import { ScopeRange } from '~/frameworks'
import { regexFindKeys } from '~/utils'
import { KeyInDocument, CurrentFile } from '~/core'

export interface KeyUsages {
  type: 'code'| 'locale'
  keys: KeyInDocument[]
  locale: string
  namespace?: string
}

export class KeyDetector {
  static getKeyByContent(text: string) {
    const keys = new Set<string>()
    const regs = Global.getUsageMatchRegex()

    for (const reg of regs) {
      (text.match(reg) || [])
        .forEach(key =>
          keys.add(key.replace(reg, '$1')),
        )
    }

    return Array.from(keys)
  }

  static getKeyRange(document: TextDocument, position: Position, dotEnding?: boolean) {
    if (Config.disablePathParsing)
      dotEnding = true

    const regs = Global.getUsageMatchRegex(document.languageId, document.uri.fsPath)
    for (const regex of regs) {
      const range = document.getWordRangeAtPosition(position, regex)
      if (range) {
        const key = document.getText(range).replace(regex, '$1')

        if (dotEnding) {
          if (!key || key.endsWith('.'))
            return { range, key }
        }
        else {
          return { range, key }
        }
      }
    }
  }

  static getKey(document: TextDocument, position: Position, dotEnding?: boolean) {
    const keyRange = KeyDetector.getKeyRange(document, position, dotEnding)
    return keyRange?.key
  }

  static getScopedKey(document: TextDocument, position: Position) {
    const scopes = Global.enabledFrameworks.flatMap(f => f.getScopeRange(document) || [])
    if (scopes.length > 0) {
      const offset = document.offsetAt(position)
      return scopes.filter(s => s.start < offset && offset < s.end).map(s => s.namespace).join('.')
    }
  }

  static getKeyAndRange(document: TextDocument, position: Position, dotEnding?: boolean) {
    const { range, key } = KeyDetector.getKeyRange(document, position, dotEnding) || {}
    if (!range || !key)
      return

    const end = range.end.character - 1
    const start = end - key.length
    const keyRange = new Range(
      new Position(range.end.line, start),
      new Position(range.end.line, end),
    )
    return {
      range: keyRange,
      key,
    }
  }

  static init(ctx: ExtensionContext) {
    workspace.onDidChangeTextDocument(
      (e) => {
        delete this._get_keys_cache[e.document.uri.fsPath]
      },
      null,
      ctx.subscriptions,
    )
  }

  private static _get_keys_cache: Record<string, KeyInDocument[]> = {}

  static getKeys(document: TextDocument | string, regs?: RegExp[], dotEnding?: boolean, scopes?: ScopeRange[]): KeyInDocument[] {
    let text = ''
    let rewriteContext: RewriteKeyContext | undefined
    let filepath = ''
    if (typeof document !== 'string') {
      filepath = document.uri.fsPath
      if (this._get_keys_cache[filepath])
        return this._get_keys_cache[filepath]

      regs = regs ?? Global.getUsageMatchRegex(document.languageId, filepath)
      text = document.getText()
      rewriteContext = {
        targetFile: filepath,
      }
      scopes = scopes || Global.enabledFrameworks.flatMap(f => f.getScopeRange(document) || [])
    }
    else {
      regs = Global.getUsageMatchRegex()
      text = document
    }

    // Detect any withPrefix variable names and add them as additional regexes
    // so regexFindKeys can pick up calls like prefix("text")
    const withPrefixRegs = KeyDetector.getWithPrefixRegexes(text)
    const allRegs = withPrefixRegs.length ? [...regs, ...withPrefixRegs] : regs

    const keys = regexFindKeys(text, allRegs, dotEnding, rewriteContext, scopes)
    const resolvedKeys = KeyDetector.resolveWithPrefixKeys(text, keys)

    if (filepath)
      this._get_keys_cache[filepath] = resolvedKeys
    return resolvedKeys
  }

  /**
   * Scans the text for `withPrefix(...)` declarations and returns a regex
   * for each variable name that can be used by regexFindKeys to detect calls.
   *
   * e.g. `const prefix = withPrefix("pages.home")`
   * returns: [ /\bprefix\s*\(\s*['"]({key})['"]\s*\)/gm ]
   */
  static getWithPrefixRegexes(text: string): RegExp[] {
    const declarationReg = /\b(const|let|var)\s+([\w$]+)\s*=\s*withPrefix\s*\(\s*['"]\s*([^'"]+?)\s*['"]\s*,?\s*\)/gms
    const regs: RegExp[] = []

    let match: RegExpExecArray | null
    declarationReg.lastIndex = 0
    // eslint-disable-next-line no-cond-assign
    while (match = declarationReg.exec(text)) {
      const varName = match[2]
      regs.push(new RegExp(`\\b${varName}\\s*\\(\\s*[\`'"]([^'\`"]+)[\`'"]\\s*,?\\s*\\)`, 'gms'))
    }

    return regs
  }

  static resolveWithPrefixKeys(text: string, keys: KeyInDocument[]): KeyInDocument[] {
    const declarationReg = /\b(const|let|var)\s+([\w$]+)\s*=\s*withPrefix\s*\(\s*['"]\s*([^'"]+?)\s*['"]\s*,?\s*\)/gms
    const prefixMap: Record<string, string> = {}

    let declMatch: RegExpExecArray | null
    declarationReg.lastIndex = 0
    // eslint-disable-next-line no-cond-assign
    while (declMatch = declarationReg.exec(text)) {
      const varName = declMatch[2]
      const prefixValue = declMatch[3].trim()
      prefixMap[varName] = prefixValue
    }

    if (Object.keys(prefixMap).length === 0)
      return keys

    const result = [...keys]

    for (const [varName, prefix] of Object.entries(prefixMap)) {
      const callReg = new RegExp(`\\b${varName}\\s*\\(\\s*(['\`"])([^'\`"]+)\\1\\s*,?\\s*\\)`, 'gms')
      callReg.lastIndex = 0

      let callMatch: RegExpExecArray | null
      // eslint-disable-next-line no-cond-assign
      while (callMatch = callReg.exec(text)) {
        const suffix = callMatch[2]

        const matchString = callMatch[0]
        const suffixStart = callMatch.index + matchString.lastIndexOf(suffix)
        const suffixEnd = suffixStart + suffix.length

        const existing = result.find(k => k.start === suffixStart && k.end === suffixEnd)
        if (!existing)
          continue

        const existingKey = existing.key
        let namespacePrefix: string | undefined

        if (existingKey !== suffix && existingKey.endsWith(`.${suffix}`))
          namespacePrefix = existingKey.slice(0, existingKey.length - suffix.length - 1)
        else
          namespacePrefix = Config.defaultNamespace

        existing.key = namespacePrefix
          ? `${namespacePrefix}.${prefix}.${suffix}`
          : `${prefix}.${suffix}`
      }
    }

    return result
  }

  static getUsages(document: TextDocument, loader?: Loader): KeyUsages | undefined {
    if (loader == null)
      loader = CurrentFile.loader

    let keys: KeyInDocument[] = []
    let locale = Config.displayLanguage
    let namespace: string | undefined
    let type: 'locale' | 'code' = 'code'
    const filepath = document.uri.fsPath

    // locale file
    const localeFile = loader.files.find(f => f?.filepath === filepath)
    if (localeFile) {
      type = 'locale'
      const parser = Global.enabledParsers.find(p => p.annotationLanguageIds.includes(document.languageId))
      if (!parser)
        return

      if (Global.namespaceEnabled)
        namespace = loader.getNamespaceFromFilepath(filepath)

      locale = localeFile.locale
      keys = parser.annotationGetKeys(document)
        .filter(({ key }) => loader!.getTreeNodeByKey(key)?.type === 'node')
    }
    // code
    else if (Global.isLanguageIdSupported(document.languageId)) {
      keys = KeyDetector.getKeys(document)
    }
    else {
      return
    }

    return {
      type,
      keys,
      locale,
      namespace,
    }
  }
}
