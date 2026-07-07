<p align="center">
  <img src="https://github.com/RobertOstermann/vscode-i18n-ally/blob/main/screenshots/full-logo-new.png?raw=true" alt="logo" width="450"/>
</p>

> **⚠️ This is a fork of [lokalise/i18n-ally](https://github.com/lokalise/i18n-ally).**

- Extends the original extension with additional controls over which problems are displayed in the editor, giving you finer-grained configuration to suppress or highlight specific i18n diagnostics based on your project's needs.
- Adds support for the `withPrefix` pattern, which allows you to define a translation key prefix once and reuse it with suffix keys. The extension will automatically resolve the full key for annotations, hover, and diagnostics.
- Adds the `ignoreMissingKeys` setting, which silently ignores any detected keys that do not exist in your locale files — useful when your regex patterns intentionally match dynamic or partially-constructed keys.

## ⚙️ Additional Configuration

### `i18n-ally.ignoreMissingKeys`

**Type:** `boolean` | **Default:** `false`

When enabled, any translation keys detected in your code that do not exist in your locale files will be silently ignored. They will not appear in inline annotations, hover tooltips, or the problems panel.

This is useful when your `usageMatchRegex` patterns are broad and may match dynamic keys or partially-constructed strings that are not expected to resolve to a valid locale entry.

```json
{
  "i18n-ally.ignoreMissingKeys": true
}
```

## withPrefix

```ts
/**
 * Creates a helper that combines a translation key prefix with a suffix key,
 * returning a fully typed literal string.
 *
 * Autocomplete for `key` is limited to the valid suffixes for the provided
 * `prefix`.
 *
 * @example
 *   const prefix = withPrefix(
 *     "pages.travel.steps.preferences.sections.car_service",
 *   );
 *   const key = prefix("banner"); // "pages.travel.steps.preferences.sections.car_service.banner"
 */
export const withPrefix =
  <TPrefix extends TranslationKeyPrefix>(prefix: TPrefix) =>
  <TKey extends TranslationKeySuffix<TPrefix>>(
    key: TKey,
  ): `${TPrefix}.${TKey}` => {
    return `${prefix}.${key}` as `${TPrefix}.${TKey}`;
  };
```

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.i18n-ally-ostermann" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/RobertOstermann.i18n-ally-ostermann?color=blue&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.i18n-ally-ostermann" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/d/RobertOstermann.i18n-ally-ostermann?color=4bdbe3" alt="Visual Studio Marketplace Downloads" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.i18n-ally-ostermann" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/i/RobertOstermann.i18n-ally-ostermann?color=63ba83" alt="Visual Studio Marketplace Installs" /></a>
<br/>
<a href="https://github.com/lokalise/i18n-ally/wiki" target="__blank"><img alt="Wiki" src="https://img.shields.io/static/v1?label=docs&message=wiki&color=e3897b"></a>
<a href="https://github.com/lokalise/i18n-ally" target="__blank"><img src="https://img.shields.io/github/last-commit/lokalise/i18n-ally?color=c977be" alt="GitHub last commit" /></a>
<a href="https://github.com/lokalise/i18n-ally/issues" target="__blank"><img src="https://img.shields.io/github/issues/lokalise/i18n-ally?color=a38eed" alt="GitHub issues" /></a>
<a href="https://github.com/lokalise/i18n-ally" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/lokalise/i18n-ally?style=social"></a>
</p>

<p align='center'>
<b>v2.0</b> is released with new <a href='https://github.com/lokalise/i18n-ally/wiki/Editor-UI'>Editor UI</a> and <a href='https://github.com/lokalise/i18n-ally/wiki/Review-&-Collaboration-System'>Review System</a> 🎉
</p>

<p align='center'><i>
<a href="https://github.com/lokalise/i18n-ally/wiki/Migration-v1.x">Migrate from v1.x</a>
</i></p>
<br>

<p align="center">
<a href='https://github.com/lokalise/i18n-ally/wiki/Supported-Frameworks' target="__blank">
<img src="https://github.com/lokalise/i18n-ally/blob/screenshots/supported-frameworks.png?raw=true" alt="Supported Frameworks" width="550"/>
</a>
</p>

<h3 align="center">Maintained by</h3>
<p align="center">
<a title="Lokalise: accelerate localization from code to delivery" href="https://lokalise.com/?utm_source=vscmarket&amp;utm_campaign=i18nally&amp;utm_medium=banner"><img src="https://github.com/lokalise/i18n-ally/raw/screenshots/lokalise-logo.png?raw=true" alt="Lokalise logo" width="275px"></a><br>
<sup>Lokalise is the fastest growing language cloud technology made by developers, for developers.<br>
As a collaborative productivity platform, it helps structure and automate the translation and localization process for any company in the world.<br>
<a title="Lokalise: accelerate localization from code to delivery" href="https://lokalise.com/?utm_source=vscmarket&amp;utm_campaign=i18nally&amp;utm_medium=banner">Learn more</a></sup>
</p>

<br>

<br>

<h4 align="center">
<a href="https://github.com/lokalise/i18n-ally/wiki">📖 Docs</a>
&nbsp;|&nbsp;
<a href="https://github.com/lokalise/i18n-ally/wiki/FAQ">💭 FAQ</a>
&nbsp;|&nbsp;
<a href="https://github.com/lokalise/i18n-ally/wiki/Configurations">⚙️ Configs</a>
&nbsp;|&nbsp;
<a href="https://github.com/lokalise/i18n-ally/wiki/Locale-Formats#supported-locale-formats">📜 Supported Formats</a>
&nbsp;|&nbsp;
<a href="https://github.com/lokalise/i18n-ally/wiki/Contribute">🧱 Contribute</a>
</h4>

<br>
<br>

<h3 align='center'>Demo</h3>

<div align="center">

[![i18n-ally on VS code demo](https://img.youtube.com/vi/kowM-MoGVns/0.jpg)](https://youtu.be/kowM-MoGVns)

</div>

<br>
<br>

<h3 align='center'>Inline Annotations</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/annotation-animated.gif?raw=true)

<h3 align='center'>Hover and Direct Actions</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/hover.png?raw=true)

<h3 align='center'>Manage All Translations in One Place</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/review-sidebar.png?raw=true)

<h3 align='center'><a href='https://github.com/lokalise/i18n-ally/wiki/Editor-UI'>Editor UI</a> & <a href='https://github.com/lokalise/i18n-ally/wiki/Review-&-Collaboration-System'>Review System</a></h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/review-editor.png?raw=true)

<h3 align='center'>Extract Translations from Code</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/extract.png?raw=true)

<h3 align='center'>Report Missing Translations</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/problems.png?raw=true)

<h3 align='center'>Machine Translation</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/quick-actions.png?raw=true)

<h3 align='center'>Annotations for JSON and YAML</h3>

![](https://github.com/lokalise/i18n-ally/blob/screenshots/annotation-locale.png?raw=true)

<h3 align="center">General Features</h3>

- Supports multi-root workspaces
- Supports remote development
- Supports numerous popular frameworks
- Supports [linked locale messages](https://kazupon.github.io/vue-i18n/guide/messages.html#linked-locale-messages)
- Uses i18n for the extension itself, of course. [Translation List](https://github.com/lokalise/i18n-ally#-multilingual-support)


## 🌍 Multilingual Support

This extension itself supports i18n as well. It will be auto-matched to the display language you use in your VS Code editor. We currently support the following languages.

| Language | Maintainer | Contributors |
| --- | --- | --- |
| English    | [@antfu](https://github.com/antfu)          | [@rubjo](https://github.com/rubjo), [@EdRands](https://github.com/EdRands) |
| Simplified Chinese (简体中文)  | [@antfu](https://github.com/antfu)           |       |
| Traditional Chinese (繁體中文)  | [@antfu](https://github.com/antfu)           |       |
| Norwegian (Norsk)  |  | [@rubjo](https://github.com/rubjo)       |
| Spanish (Español) |  | [@Baltimer](https://github.com/Baltimer) |
| Japanese (日本語) |  | [@isdh](https://github.com/isdh) |
| Dutch (Nederlands) |  | [@Niekvdm](https://github.com/Niekvdm), [@Excalibaard](https://github.com/Excalibaard) |
| Portuguese (Brazilian)  |  | [@Ibcs16](https://github.com/Ibcs16) |
| French (Français) |  | [@Nicoxx45](https://github.com/Nicoxx45), [@eri](https://github.com/eri), [@Frank](https://github.com/FrankSAURET) |
| Swedish (Svenska) | [@vladdeSV](https://github.com/vladdeSV) |  |
| Ukrainian (Українська) |  | [@uhodav](https://github.com/uhodav) |
| Russian (Русский) |  | [@uhodav](https://github.com/uhodav) |
| German (Deutsch) | [@alexanderniebuhr](https://github.com/alexanderniebuhr) | |
| Thai (ภาษาไทย) | [@watchakorn-18k](https://github.com/watchakorn-18k) |  |
| Turkish (Türkçe) |  | [@eri](https://github.com/eri), [@dilekerkut](https://github.com/dilekerkut) |
| Korean (한국어) |  | [@moka-ayumu](https://github.com/moka-ayumu) |
| Hungarian (Magyar)  | [@Cs4K1Sr4C](https://github.com/Cs4K1Sr4C)  | [@Cs4K1Sr4C](https://github.com/Cs4K1Sr4C)  |

[**Help Translate**](https://github.com/lokalise/i18n-ally/wiki/Contribute#working-on-translations)

> 👨‍💻 If you would like to help a language's translation up to date, feel free to put your name in the **Maintainers** field. I will @mention you when needed. Much appreciated.

## ❤️ Thanks

This extension was inspired by [think2011/vscode-vue-i18n](https://github.com/think2011/vscode-vue-i18n), it wouldn't exist without [@think2011](https://github.com/think2011)'s great work.

Support for Vue Single File Component (SFC) is powered by [kazupon/vue-i18n-locale-message](https://github.com/kazupon/vue-i18n-locale-message), which is created by the author of vue-i18n. Thanks for making this!


### Code Contributors

My great thanks to all the awesome contributors:

<a href="https://github.com/lokalise/i18n-ally/graphs/contributors"><img src="https://contrib.rocks/image?repo=lokalise/i18n-ally" /></a>

## 📄 License

[MIT License](https://github.com/lokalise/i18n-ally/blob/master/LICENSE) © 2021-PRESENT [Lokalise](https://github.com/lokalise)

MIT License © 2019-2020 [Anthony Fu](https://github.com/antfu)

MIT License © 2018-2019 [think2011](https://github.com/think2011)
