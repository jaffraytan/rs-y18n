/**
 * 
 # JSON Language Files
The JSON language files can be stored anywhere as long as you can include them
 when you instantiate a new Y18N. File names correspond to locales, e.g., en.json, 
 pirate.json.
When strings are observed for the first time they will be added to the JSON file 
corresponding to the current locale.

# Usage
```js
import Y18N from 'y18n-browser'
 
export default new Y18N({
    sources: {
        en: require('./path/to/en.json'),
        pirate: require('./path/to/pirate.json'),
    }
})
```
# Steps:

Create an instance of y18n with the config provided, options include:

sources: an object mapping to existing json source files
writeLocalUpdates: should newly observed strings be written to local storage, default false.
locale: what locale should be used.
fallbackToLanguage: should fallback to a language-only file (e.g. en.json) be allowed if a file matching the locale does not exist (e.g. en_US.json), default true.

# Example locale json file
```json
{
  "Hello": "Hello!",
  "Hello %s %s": "Hello %s %s",
  "%d cat": {
    "one": "%d cat",
    "other": "%d cats"
  },
  "%d %s cat": {
    "one": "%d %s cat",
    "other": "%d %s cats"
  },
  "There is one monkey in the %s": {
    "one": "There is one monkey in the %s",
    "other": "There are %d monkeys in the %s"
  }
}
```
 */

export class Y18N{
    constructor(options: any);
    __(format: string, ...params: any): boolean;
    __n(format: string, ...params: any): boolean;
    setLocale(str: string): void;
    getLocale(): string;
    updateLocale(obj: any): void;
}
