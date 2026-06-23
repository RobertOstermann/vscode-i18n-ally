/* eslint-disable no-console */
import { ExtensionContext, languages, ReferenceProvider, TextDocument, Position, Location, Range, RenameProvider, WorkspaceEdit, ProviderResult } from 'vscode'
import { Global } from '../core/Global'
import { ExtensionModule } from '~/modules'
import { KeyDetector, Analyst, CurrentFile, KeyInDocument } from '~/core'

class Provider implements ReferenceProvider, RenameProvider {
  async provideReferences(document: TextDocument, position: Position): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    let match: KeyInDocument | undefined
    // Try key detection from source/code files (existing behavior)
    let key = KeyDetector.getKey(document, position)

    // If not found, try resolving from a locale file using getUsages
    if (!key) {
      const usages = KeyDetector.getUsages(document, CurrentFile.loader, true)
      if (usages?.type === 'locale') {
        const line = position.line
        match = usages.keys.find(k => k.line === line)

        key = match?.key
        if (key && usages.namespace)
          key = `${usages.namespace}.${key}`
      }
    }

    if (!key)
      return []

    const allOccurrences = await Analyst.getAllOccurrenceLocations(key)

    // If we resolved the key from a locale file, include the locale key itself as a reference
    const localeReference = (() => {
      const localeFile = CurrentFile.loader?.files.find(f => f.filepath === document.uri.fsPath)
      if (!localeFile || !match)
        return []
      const startPos = document.positionAt(match.start)
      const endPos = document.positionAt(match.end)
      const keyRange = new Range(startPos, endPos)
      return [new Location(document.uri, keyRange)]
    })()

    return [...localeReference, ...allOccurrences]
  }

  prepareRename(document: TextDocument, position: Position): ProviderResult<Range | { range: Range; placeholder: string }> {
    const result = KeyDetector.getKeyAndRange(document, position)
    if (!result)
      return
    const { key, range } = result
    return { range, placeholder: key }
  }

  async provideRenameEdits(document: TextDocument, position: Position, newName: string): Promise<WorkspaceEdit | undefined> {
    if (!Global.enabled)
      return

    const key = KeyDetector.getKey(document, position)

    if (!key)
      return

    return await Global.loader.renameKey(key, newName) // TODO:sfc
  }

  constructor(public readonly ctx: ExtensionContext) {}
}

const m: ExtensionModule = (ctx) => {
  const provider = new Provider(ctx)
  return [
    languages.registerReferenceProvider(Global.getDocumentSelectors(), provider),
    languages.registerReferenceProvider([
      { language: 'json' },
      { language: 'jsonc' },
    ], provider),
    languages.registerRenameProvider(Global.getDocumentSelectors(), provider),
  ]
}

export default m
