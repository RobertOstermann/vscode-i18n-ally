import { ExtensionContext, commands, workspace } from 'vscode'
import { flatten } from 'lodash'
import { version } from '../package.json'
import { Global, Config, KeyDetector, CurrentFile } from '~/core'
import commandsModules, { Commands } from '~/commands'
import viewsModules from '~/views'
import { Log } from '~/utils'
import i18n from '~/i18n'
import editorModules from '~/editor'

export async function activate(ctx: ExtensionContext) {
  Log.info(`🈶 Activated, v${version}`)

  Config.ctx = ctx

  i18n.init(ctx.extensionPath)
  KeyDetector.init(ctx)

  // activate the extension
  await Global.init(ctx)
  CurrentFile.watch(ctx)

  // sync initial context keys
  commands.executeCommand('setContext', 'i18n-ally.contextMenu.disabled', Config.contextMenuDisabled)

  // watch for config changes
  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('i18n-ally.contextMenu.disabled'))
        commands.executeCommand('setContext', 'i18n-ally.contextMenu.disabled', Config.contextMenuDisabled)
    }),
  )

  const modules = [
    commandsModules,
    editorModules,
    viewsModules,
  ]

  const disposables = flatten(modules.map(m => m(ctx)))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate() {
  Log.info('🈚 Deactivated')
}

export {
  Global,
  CurrentFile,
  KeyDetector,
  Config,
  Log,
  Commands,
}
