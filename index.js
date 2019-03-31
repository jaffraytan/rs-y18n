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
;(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(global, exports) :
	typeof define === 'function' && define.amd ? define([global, 'exports'], factory) :
	(factory(global, global));
}(this, (function (global, exports) { 'use strict';

var noop = function () {}

function Y18N (opts) {
  // configurable options.
  opts = opts || {}
  this._writeLocalUpdates = !!opts.writeLocalUpdates
  this._locale = opts.locale || 'en'
  this._fallbackToLanguage = opts.fallbackToLanguage !== false

  // internal stuff.
  this._localStorage = opts.localStorage || global.localStorage
  this._cache = {}

  // clone of input sources for cache
  var sources = opts.sources || {}
  Object.keys(sources).forEach(function (locale) {
    this._cache[locale] = {}
    Object.keys(sources[locale]).forEach(function (key) {
      this._cache[locale][key] = sources[locale][key]
    }, this)
  }, this)

  if (this._writeLocalUpdates) {
    var localData
    var sourceData
    var sourceIsUpdated = false
    Object.keys(this._cache).forEach(function (locale) {
      sourceData = this._cache[locale]
      sourceIsUpdated = false
      try {
        // grab from local storage
        localData = JSON.parse(this._localStorage['y18n-' + locale])
        sourceIsUpdated = Object.keys(localData).every(function (key) {
          return key in sourceData
        })
      } catch (e) {
        localData = {}
        sourceIsUpdated = true
      }

      // the source has all the latest keys for this locale,
      // delete from local storage
      if (sourceIsUpdated) {
        delete this._localStorage['y18n-' + locale]
      // local data still has entries we don't have in source,
      // merge the two, update local storage and cache
      } else {
        // apply local storage data over source data if it doesn't exist
        Object.keys(localData).forEach(function (key) {
          if (!(key in sourceData)) {
            sourceData[key] = localData[key]
          }
        })
        this._localStorage['y18n-' + locale] = JSON.stringify(sourceData, null, '\t')
        this._cache[locale] = sourceData
      }
    }, this)
  }

  this.__ = this.__.bind(this)
  this.__n = this.__n.bind(this)
  this.setLocale = this.setLocale.bind(this)
  this.getLocale = this.getLocale.bind(this)
  this.updateLocale = this.updateLocale.bind(this)
  this.getUpdates = this.getUpdates.bind(this)
  this.clearUpdates = this.clearUpdates.bind(this)
}

Y18N.prototype._writeLocal = function (locale, cb) {
  // write to local storage
  this._localStorage['y18n-' + this._resolveLocaleKey(locale)] = JSON.stringify(this._cache[locale], null, '\t')

  // let __ and __n return before firing cb (also can support async writing in the future)
  setTimeout(cb, 1)
}

Y18N.prototype._resolveLocaleKey = function (locale) {
  // attempt fallback to language only
  if (this._fallbackToLanguage && ~locale.lastIndexOf('_')) {
    var language = locale.split('_')[0]
    if (this._cache[language]) {
      return language
    }
  }
  return locale
}

Y18N.prototype._initLocale = function () {
  const locale = this._resolveLocaleKey(this._locale)
  if (locale !== this._locale) {
    this._cache[this._locale] = this._cache[locale]
  }
  this._cache[this._locale] = this._cache[this._locale] || {}
}

Y18N.prototype.__ = function () {
  var args = Array.prototype.slice.call(arguments)
  var str = args.shift()
  var cb = noop // start with noop.

  if (typeof args[args.length - 1] === 'function') cb = args.pop()
  cb = cb || noop // noop.

  if (!this._cache[this._locale]) this._initLocale()

  // we've observed a new string, update the language file.
  if (!this._cache[this._locale][str] && this._writeLocalUpdates) {
    this._cache[this._locale][str] = str

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._writeLocal(this._locale, cb)
  } else {
    cb()
  }

  return vsprintf(this._cache[this._locale][str] || str, args)
}

Y18N.prototype.__n = function () {
  var args = Array.prototype.slice.call(arguments)
  var singular = args.shift()
  var plural = args.shift()
  var quantity = args.shift()

  var cb = noop // start with noop.
  if (typeof args[args.length - 1] === 'function') cb = args.pop()

  if (!this._cache[this._locale]) this._initLocale()

  var str = quantity === 1 ? singular : plural
  if (this._cache[this._locale][singular]) {
    str = this._cache[this._locale][singular][quantity === 1 ? 'one' : 'other']
  }

  // we've observed a new string, update the language file.
  if (!this._cache[this._locale][singular] && this._writeLocalUpdates) {
    this._cache[this._locale][singular] = {
      one: singular,
      other: plural
    }

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._writeLocal(this._locale, cb)
  } else {
    cb()
  }

  // if a %d placeholder is provided, add quantity
  // to the arguments expanded by vsprintf.
  var values = []
  if (~str.indexOf('%d')) values.push(quantity)

  return vsprintf(str, values.concat(args))
}

Y18N.prototype.setLocale = function (locale) {
  this._locale = locale
}

Y18N.prototype.getLocale = function () {
  return this._locale
}

Y18N.prototype.updateLocale = function (obj) {
  if (!this._cache[this._locale]) this._initLocale()

  for (var key in obj) {
    this._cache[this._locale][key] = obj[key]
  }
}

Y18N.prototype.getUpdates = function (locale) {
  locale = locale || this._locale

  return this._localStorage['y18n-' + this._resolveLocaleKey(locale)]
}

Y18N.prototype.clearUpdates = function (locale) {
  locale = locale || this._locale

  delete this._localStorage['y18n-' + this._resolveLocaleKey(locale)]
}

// module.exports = Y18N

exports.Y18N = Y18N;

})));