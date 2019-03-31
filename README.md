# rs-y18n

一个跨平台的前端国际化JS库。从y18n-browser改进而来。
Cross-platform internationalization library. Inspired by i18n, y18n and y18n-browser.

# 1. 安装 (Installation)
```bash
npm install sprintf-js --save
# in stall @types/sprintf for ts project
npm install @types/sprintf --save-dev
npm install rs-y18n --save
```

# 2. 使用 (Usage)
## 2.1) Node.js环境 (for Node.js Project)
```js
const self = global ? global : window;
self['vsprintf']  = require('./sprintf').vsprintf;//Y18N depends vsprintf global function

var Y18N = require('./index').Y18N;//constructor
const options = {};
const y18n = new Y18N(options);

console.log(y18n.__('my awesome string %s', 'foo'));//my awesome string foo
```


## 2.2) TS（Angular）环境 (for TypeScript, Angular Project)

```ts
import { Component, OnInit } from '@angular/core';
import { vsprintf } from "sprintf-js";
import { Y18N } from "y18n-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  ngOnInit() {
    window['vsprintf'] = vsprintf;//将vsprintf置为全局变量

    const options = {
      locale: 'zh_CN',
      sources: {
        zh_CN: {
          "Hello": "您好！",
          "Hello %s %s": "%s%s您好！",
          "%d cat": {
            "one": "%d 只猫",
            "other": "%d 只猫"
          },
          "%d %s cat": {
            "one": "%d 只%s猫",
            "other": "%d 只%s猫"
          },
          "There is one monkey in the %s": {
            "one": "%d 只猴子在%s里",
            "other": "%d 只猴子在%s里"
          }
        },
        en_US: {
          "Hello": "Hello!",
          "Hello %s %s": "Hello %s %s!",
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
      }
    };

    const y18n = new Y18N(options);
    // y18n.setLocale('zh_CN');
    console.log(y18n.__("Hello %s %s", '谭', "先生"));//谭先生您好！
    console.log(y18n.__n("%d %s cat", "%d %s cats", 1, '黑'));//1 只黑猫
    console.log(y18n.__n("%d %s cat", "%d %s cats", 3, '黑'));//3 只黑猫
    console.log(y18n.__n("There is one monkey in the %s", "", 1 , '树林'));//1 只猴子在树林里
    console.log(y18n.__n("There is one monkey in the %s", "", 3 , '树林'));//3 只猴子在树林里

    y18n.setLocale('en_US');
    console.log(y18n.__("Hello %s %s", 'Mr.', "Tan"));//Hello Mr. Tan!
    console.log(y18n.__n("%d %s cat", "", 1, 'black'));//1 black cat
    console.log(y18n.__n("%d %s cat", "", 3, 'black'));//3 black cats
    console.log(y18n.__n("There is one monkey in the %s", "", 1 , 'tree'));//There is one monkey in the tree
    console.log(y18n.__n("There is one monkey in the %s", "", 3 , 'tree'));//There are 3 monkeys in the tree
  }
}
```

## 2.3) 浏览器环境 (In Browser)
```html
<script src="./sprintf.js"></script>
<script src="./index.js"></script>

<script>
    const y18n = new Y18N();
    console.log(y18n.__('my awesome string %s', 'foo'));//my awesome string foo
</script>
```



## JSON语言文件 (JSON Language Files)

The JSON language files can be stored anywhere as long as you can include them
when you instantiate a new Y18N.
File names correspond to locales, e.g., `en.json`, `pirate.json`.

When strings are observed for the first time they will be
added to the JSON file corresponding to the current locale.

## Usage

It is recommended to create a helper file/module to handle constructing a new Y18N instance like so:

`y18n.js`

```js
import Y18N from 'y18n-browser'

export default new Y18N({
	sources: {
		en: require('./path/to/en.json'),
		pirate: require('./path/to/pirate.json'),
	}
})
```

Create an instance of y18n with the config provided, options include:

* `sources`: an object mapping to existing json source files
* `writeLocalUpdates`: should newly observed strings be written to local storage, default `false`.
* `locale`: what locale should be used.
* `fallbackToLanguage`: should fallback to a language-only file (e.g. `en.json`)
  be allowed if a file matching the locale does not exist (e.g. `en_US.json`),
  default `true`.

## Methods

### import y18n from './my/instance/y18n'

Now you can use your configured instance anywhere.

### y18n.\_\_(str, arg, arg, arg)

Print a localized string, `%s` will be replaced with `arg`s.

### y18n.\_\_n(singularString, pluralString, count, arg, arg, arg)

Print a localized string with appropriate pluralization. If `%d` is provided
in the string, the `count` will replace this placeholder.

### y18n.setLocale(str)

Set the current locale being used.

### y18n.getLocale()

What locale is currently being used?

### y18n.updateLocale(obj)

Update the current locale with the key value pairs in `obj`.

## Example locale json file
> en_US.json:
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
> zh_CN.json:

```json
{
  "Hello": "您好！",
  "Hello %s %s": "%s%s您好！",
  "%d cat": {
    "one": "%d 只猫",
    "other": "%d 只猫"
  },
  "%d %s cat": {
    "one": "%d 只%s猫",
    "other": "%d 只%s猫"
  },
  "There is one monkey in the %s": {
    "one": "%d 只猴子在%s里",
    "other": "%d 只猴子在%s里"
  }
}
```

## License

MIT
