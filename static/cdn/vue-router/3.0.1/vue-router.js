/**
  * vue-router v3.0.1
  * (c) 2017 Evan You
  * @license MIT
  */
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.VueRouter = factory());
  }(this, (function () { 'use strict';
  
  /*  */
  
  function assert (condition, message) {
    if (!condition) {
      throw new Error(("[vue-router] " + message))
    }
  }
  
  function warn (condition, message) {
    if ("development" !== 'production' && !condition) {
      typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
    }
  }
  
  function isError (err) {
    return Object.prototype.toString.call(err).indexOf('Error') > -1
  }
  
  let View = {
    name: 'router-view',
    functional: true,
    props: {
      name: {
        type: String,
        default: 'default'
      }
    },
    render: function render (_, ref) {
      let props = ref.props;
      let children = ref.children;
      let parent = ref.parent;
      let data = ref.data;
  
      data.routerView = true;
  
      // directly use parent context's createElement() function
      // so that components rendered by router-view can resolve named slots
      let h = parent.$createElement;
      let name = props.name;
      let route = parent.$route;
      let cache = parent._routerViewCache || (parent._routerViewCache = {});
  
      // determine current view depth, also check to see if the tree
      // has been toggled inactive but kept-alive.
      let depth = 0;
      let inactive = false;
      while (parent && parent._routerRoot !== parent) {
        if (parent.$vnode && parent.$vnode.data.routerView) {
          depth++;
        }
        if (parent._inactive) {
          inactive = true;
        }
        parent = parent.$parent;
      }
      data.routerViewDepth = depth;
  
      // render previous view if the tree is inactive and kept-alive
      if (inactive) {
        return h(cache[name], data, children)
      }
  
      let matched = route.matched[depth];
      // render empty node if no matched route
      if (!matched) {
        cache[name] = null;
        return h()
      }
  
      let component = cache[name] = matched.components[name];
  
      // attach instance registration hook
      // this will be called in the instance's injected lifecycle hooks
      data.registerRouteInstance = function (vm, val) {
        // val could be undefined for unregistration
        let current = matched.instances[name];
        if (
          (val && current !== vm) ||
          (!val && current === vm)
        ) {
          matched.instances[name] = val;
        }
      }
  
      // also register instance in prepatch hook
      // in case the same component instance is reused across different routes
      ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
        matched.instances[name] = vnode.componentInstance;
      };
  
      // resolve props
      let propsToPass = data.props = resolveProps(route, matched.props && matched.props[name]);
      if (propsToPass) {
        // clone to prevent mutation
        propsToPass = data.props = extend({}, propsToPass);
        // pass non-declared props as attrs
        let attrs = data.attrs = data.attrs || {};
        for (let key in propsToPass) {
          if (!component.props || !(key in component.props)) {
            attrs[key] = propsToPass[key];
            delete propsToPass[key];
          }
        }
      }
  
      return h(component, data, children)
    }
  };
  
  function resolveProps (route, config) {
    switch (typeof config) {
      case 'undefined':
        return
      case 'object':
        return config
      case 'function':
        return config(route)
      case 'boolean':
        return config ? route.params : undefined
      default:
        {
          warn(
            false,
            "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
            "expecting an object, function or boolean."
          );
        }
    }
  }
  
  function extend (to, from) {
    for (let key in from) {
      to[key] = from[key];
    }
    return to
  }
  
  /*  */
  
  let encodeReserveRE = /[!'()*]/g;
  let encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  let commaRE = /%2C/g;
  
  // fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas
  let encode = function (str) { return encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ','); };
  
  let decode = decodeURIComponent;
  
  function resolveQuery (
    query,
    extraQuery,
    _parseQuery
  ) {
    if ( extraQuery === void 0 ) extraQuery = {};
  
    let parse = _parseQuery || parseQuery;
    let parsedQuery;
    try {
      parsedQuery = parse(query || '');
    } catch (e) {
      "development" !== 'production' && warn(false, e.message);
      parsedQuery = {};
    }
    for (let key in extraQuery) {
      parsedQuery[key] = extraQuery[key];
    }
    return parsedQuery
  }
  
  function parseQuery (query) {
    let res = {};
  
    query = query.trim().replace(/^(\?|#|&)/, '');
  
    if (!query) {
      return res
    }
  
    query.split('&').forEach(function (param) {
      let parts = param.replace(/\+/g, ' ').split('=');
      let key = decode(parts.shift());
      let val = parts.length > 0
        ? decode(parts.join('='))
        : null;
  
      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });
  
    return res
  }
  
  function stringifyQuery (obj) {
    let res = obj ? Object.keys(obj).map(function (key) {
      let val = obj[key];
  
      if (val === undefined) {
        return ''
      }
  
      if (val === null) {
        return encode(key)
      }
  
      if (Array.isArray(val)) {
        let result = [];
        val.forEach(function (val2) {
          if (val2 === undefined) {
            return
          }
          if (val2 === null) {
            result.push(encode(key));
          } else {
            result.push(encode(key) + '=' + encode(val2));
          }
        });
        return result.join('&')
      }
  
      return encode(key) + '=' + encode(val)
    }).filter(function (x) { return x.length > 0; }).join('&') : null;
    return res ? ("?" + res) : ''
  }
  
  /*  */
  
  
  let trailingSlashRE = /\/?$/;
  
  function createRoute (
    record,
    location,
    redirectedFrom,
    router
  ) {
    let stringifyQuery$$1 = router && router.options.stringifyQuery;
  
    let query = location.query || {};
    try {
      query = clone(query);
    } catch (e) {}
  
    let route = {
      name: location.name || (record && record.name),
      meta: (record && record.meta) || {},
      path: location.path || '/',
      hash: location.hash || '',
      query: query,
      params: location.params || {},
      fullPath: getFullPath(location, stringifyQuery$$1),
      matched: record ? formatMatch(record) : []
    };
    if (redirectedFrom) {
      route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery$$1);
    }
    return Object.freeze(route)
  }
  
  function clone (value) {
    if (Array.isArray(value)) {
      return value.map(clone)
    } else if (value && typeof value === 'object') {
      let res = {};
      for (let key in value) {
        res[key] = clone(value[key]);
      }
      return res
    } else {
      return value
    }
  }
  
  // the starting route that represents the initial state
  let START = createRoute(null, {
    path: '/'
  });
  
  function formatMatch (record) {
    let res = [];
    while (record) {
      res.unshift(record);
      record = record.parent;
    }
    return res
  }
  
  function getFullPath (
    ref,
    _stringifyQuery
  ) {
    let path = ref.path;
    let query = ref.query; if ( query === void 0 ) query = {};
    let hash = ref.hash; if ( hash === void 0 ) hash = '';
  
    let stringify = _stringifyQuery || stringifyQuery;
    return (path || '/') + stringify(query) + hash
  }
  
  function isSameRoute (a, b) {
    if (b === START) {
      return a === b
    } else if (!b) {
      return false
    } else if (a.path && b.path) {
      return (
        a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
        a.hash === b.hash &&
        isObjectEqual(a.query, b.query)
      )
    } else if (a.name && b.name) {
      return (
        a.name === b.name &&
        a.hash === b.hash &&
        isObjectEqual(a.query, b.query) &&
        isObjectEqual(a.params, b.params)
      )
    } else {
      return false
    }
  }
  
  function isObjectEqual (a, b) {
    if ( a === void 0 ) a = {};
    if ( b === void 0 ) b = {};
  
    // handle null value #1566
    if (!a || !b) { return a === b }
    let aKeys = Object.keys(a);
    let bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false
    }
    return aKeys.every(function (key) {
      let aVal = a[key];
      let bVal = b[key];
      // check nested equality
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return isObjectEqual(aVal, bVal)
      }
      return String(aVal) === String(bVal)
    })
  }
  
  function isIncludedRoute (current, target) {
    return (
      current.path.replace(trailingSlashRE, '/').indexOf(
        target.path.replace(trailingSlashRE, '/')
      ) === 0 &&
      (!target.hash || current.hash === target.hash) &&
      queryIncludes(current.query, target.query)
    )
  }
  
  function queryIncludes (current, target) {
    for (let key in target) {
      if (!(key in current)) {
        return false
      }
    }
    return true
  }
  
  /*  */
  
  // work around weird flow bug
  let toTypes = [String, Object];
  let eventTypes = [String, Array];
  
  let Link = {
    name: 'router-link',
    props: {
      to: {
        type: toTypes,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      exact: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      event: {
        type: eventTypes,
        default: 'click'
      }
    },
    render: function render (h) {
      let this$1 = this;
  
      let router = this.$router;
      let current = this.$route;
      let ref = router.resolve(this.to, current, this.append);
      let location = ref.location;
      let route = ref.route;
      let href = ref.href;
  
      let classes = {};
      let globalActiveClass = router.options.linkActiveClass;
      let globalExactActiveClass = router.options.linkExactActiveClass;
      // Support global empty active class
      let activeClassFallback = globalActiveClass == null
              ? 'router-link-active'
              : globalActiveClass;
      let exactActiveClassFallback = globalExactActiveClass == null
              ? 'router-link-exact-active'
              : globalExactActiveClass;
      let activeClass = this.activeClass == null
              ? activeClassFallback
              : this.activeClass;
      let exactActiveClass = this.exactActiveClass == null
              ? exactActiveClassFallback
              : this.exactActiveClass;
      let compareTarget = location.path
        ? createRoute(null, location, null, router)
        : route;
  
      classes[exactActiveClass] = isSameRoute(current, compareTarget);
      classes[activeClass] = this.exact
        ? classes[exactActiveClass]
        : isIncludedRoute(current, compareTarget);
  
      let handler = function (e) {
        if (guardEvent(e)) {
          if (this$1.replace) {
            router.replace(location);
          } else {
            router.push(location);
          }
        }
      };
  
      let on = { click: guardEvent };
      if (Array.isArray(this.event)) {
        this.event.forEach(function (e) { on[e] = handler; });
      } else {
        on[this.event] = handler;
      }
  
      let data = {
        class: classes
      };
  
      if (this.tag === 'a') {
        data.on = on;
        data.attrs = { href: href };
      } else {
        // find the first <a> child and apply listener and href
        let a = findAnchor(this.$slots.default);
        if (a) {
          // in case the <a> is a static node
          a.isStatic = false;
          let extend = _Vue.util.extend;
          let aData = a.data = extend({}, a.data);
          aData.on = on;
          let aAttrs = a.data.attrs = extend({}, a.data.attrs);
          aAttrs.href = href;
        } else {
          // doesn't have <a> child, apply listener to self
          data.on = on;
        }
      }
  
      return h(this.tag, data, this.$slots.default)
    }
  };
  
  function guardEvent (e) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
    // don't redirect when preventDefault called
    if (e.defaultPrevented) { return }
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) { return }
    // don't redirect if `target="_blank"`
    if (e.currentTarget && e.currentTarget.getAttribute) {
      let target = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(target)) { return }
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true
  }
  
  function findAnchor (children) {
    if (children) {
      let child;
      for (let i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tag === 'a') {
          return child
        }
        if (child.children && (child = findAnchor(child.children))) {
          return child
        }
      }
    }
  }
  
  let _Vue;
  
  function install (Vue) {
    if (install.installed && _Vue === Vue) { return }
    install.installed = true;
  
    _Vue = Vue;
  
    let isDef = function (v) { return v !== undefined; };
  
    let registerInstance = function (vm, callVal) {
      let i = vm.$options._parentVnode;
      if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
        i(vm, callVal);
      }
    };
  
    Vue.mixin({
      beforeCreate: function beforeCreate () {
        if (isDef(this.$options.router)) {
          this._routerRoot = this;
          this._router = this.$options.router;
          this._router.init(this);
          Vue.util.defineReactive(this, '_route', this._router.history.current);
        } else {
          this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
        }
        registerInstance(this, this);
      },
      destroyed: function destroyed () {
        registerInstance(this);
      }
    });
  
    Object.defineProperty(Vue.prototype, '$router', {
      get: function get () { return this._routerRoot._router }
    });
  
    Object.defineProperty(Vue.prototype, '$route', {
      get: function get () { return this._routerRoot._route }
    });
  
    Vue.component('router-view', View);
    Vue.component('router-link', Link);
  
    let strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
  }
  
  /*  */
  
  let inBrowser = typeof window !== 'undefined';
  
  /*  */
  
  function resolvePath (
    relative,
    base,
    append
  ) {
    let firstChar = relative.charAt(0);
    if (firstChar === '/') {
      return relative
    }
  
    if (firstChar === '?' || firstChar === '#') {
      return base + relative
    }
  
    let stack = base.split('/');
  
    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }
  
    // resolve relative path
    let segments = relative.replace(/^\//, '').split('/');
    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];
      if (segment === '..') {
        stack.pop();
      } else if (segment !== '.') {
        stack.push(segment);
      }
    }
  
    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }
  
    return stack.join('/')
  }
  
  function parsePath (path) {
    let hash = '';
    let query = '';
  
    let hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }
  
    let queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }
  
    return {
      path: path,
      query: query,
      hash: hash
    }
  }
  
  function cleanPath (path) {
    return path.replace(/\/\//g, '/')
  }
  
  let isarray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };
  
  /**
   * Expose `pathToRegexp`.
   */
  let pathToRegexp_1 = pathToRegexp;
  let parse_1 = parse;
  let compile_1 = compile;
  let tokensToFunction_1 = tokensToFunction;
  let tokensToRegExp_1 = tokensToRegExp;
  
  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  let PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');
  
  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    let tokens = [];
    let key = 0;
    let index = 0;
    let path = '';
    let defaultDelimiter = options && options.delimiter || '/';
    let res;
  
    while ((res = PATH_REGEXP.exec(str)) != null) {
      let m = res[0];
      let escaped = res[1];
      let offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;
  
      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }
  
      let next = str[index];
      let prefix = res[2];
      let name = res[3];
      let capture = res[4];
      let group = res[5];
      let modifier = res[6];
      let asterisk = res[7];
  
      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }
  
      let partial = prefix != null && next != null && next !== prefix;
      let repeat = modifier === '+' || modifier === '*';
      let optional = modifier === '?' || modifier === '*';
      let delimiter = res[2] || defaultDelimiter;
      let pattern = capture || group;
  
      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        asterisk: !!asterisk,
        pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
      });
    }
  
    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }
  
    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }
  
    return tokens
  }
  
  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options))
  }
  
  /**
   * Prettier encoding of URI path segments.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeURIComponentPretty (str) {
    return encodeURI(str).replace(/[\/?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }
  
  /**
   * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeAsterisk (str) {
    return encodeURI(str).replace(/[?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }
  
  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens) {
    // Compile all the tokens into regexps.
    let matches = new Array(tokens.length);
  
    // Compile all the patterns before compilation.
    for (let i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
      }
    }
  
    return function (obj, opts) {
      let path = '';
      let data = obj || {};
      let options = opts || {};
      let encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;
  
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
  
        if (typeof token === 'string') {
          path += token;
  
          continue
        }
  
        let value = data[token.name];
        let segment;
  
        if (value == null) {
          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) {
              path += token.prefix;
            }
  
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }
  
        if (isarray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
          }
  
          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }
  
          for (let j = 0; j < value.length; j++) {
            segment = encode(value[j]);
  
            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
            }
  
            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }
  
          continue
        }
  
        segment = token.asterisk ? encodeAsterisk(value) : encode(value);
  
        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }
  
        path += token.prefix + segment;
      }
  
      return path
    }
  }
  
  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
  }
  
  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }
  
  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {!RegExp} re
   * @param  {Array}   keys
   * @return {!RegExp}
   */
  function attachKeys (re, keys) {
    re.keys = keys;
    return re
  }
  
  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options.sensitive ? '' : 'i'
  }
  
  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {!Array}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    let groups = path.source.match(/\((?!\?)/g);
  
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          asterisk: false,
          pattern: null
        });
      }
    }
  
    return attachKeys(path, keys)
  }
  
  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array}   keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    let parts = [];
  
    for (let i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }
  
    let regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  
    return attachKeys(regexp, keys)
  }
  
  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {!Array}  keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }
  
  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}          tokens
   * @param  {(Array|Object)=} keys
   * @param  {Object=}         options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }
  
    options = options || {};
  
    let strict = options.strict;
    let end = options.end !== false;
    let route = '';
  
    // Iterate over the tokens and create our regexp string.
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
  
      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        let prefix = escapeString(token.prefix);
        let capture = '(?:' + token.pattern + ')';
  
        keys.push(token);
  
        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }
  
        if (token.optional) {
          if (!token.partial) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = prefix + '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }
  
        route += capture;
      }
    }
  
    let delimiter = escapeString(options.delimiter || '/');
    let endsWithDelimiter = route.slice(-delimiter.length) === delimiter;
  
    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
    }
  
    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
    }
  
    return attachKeys(new RegExp('^' + route, flags(options)), keys)
  }
  
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {(Array|Object)=}       keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }
  
    options = options || {};
  
    if (path instanceof RegExp) {
      return regexpToRegexp(path, /** @type {!Array} */ (keys))
    }
  
    if (isarray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
    }
  
    return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
  }
  
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;
  
  /*  */
  
  // $flow-disable-line
  let regexpCompileCache = Object.create(null);
  
  function fillParams (
    path,
    params,
    routeMsg
  ) {
    try {
      let filler =
        regexpCompileCache[path] ||
        (regexpCompileCache[path] = pathToRegexp_1.compile(path));
      return filler(params || {}, { pretty: true })
    } catch (e) {
      {
        warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
      }
      return ''
    }
  }
  
  /*  */
  
  function createRouteMap (
    routes,
    oldPathList,
    oldPathMap,
    oldNameMap
  ) {
    // the path list is used to control path matching priority
    let pathList = oldPathList || [];
    // $flow-disable-line
    let pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    let nameMap = oldNameMap || Object.create(null);
  
    routes.forEach(function (route) {
      addRouteRecord(pathList, pathMap, nameMap, route);
    });
  
    // ensure wildcard routes are always at the end
    for (let i = 0, l = pathList.length; i < l; i++) {
      if (pathList[i] === '*') {
        pathList.push(pathList.splice(i, 1)[0]);
        l--;
        i--;
      }
    }
  
    return {
      pathList: pathList,
      pathMap: pathMap,
      nameMap: nameMap
    }
  }
  
  function addRouteRecord (
    pathList,
    pathMap,
    nameMap,
    route,
    parent,
    matchAs
  ) {
    let path = route.path;
    let name = route.name;
    {
      assert(path != null, "\"path\" is required in a route configuration.");
      assert(
        typeof route.component !== 'string',
        "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
        "string id. Use an actual component instead."
      );
    }
  
    let pathToRegexpOptions = route.pathToRegexpOptions || {};
    let normalizedPath = normalizePath(
      path,
      parent,
      pathToRegexpOptions.strict
    );
  
    if (typeof route.caseSensitive === 'boolean') {
      pathToRegexpOptions.sensitive = route.caseSensitive;
    }
  
    let record = {
      path: normalizedPath,
      regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
      components: route.components || { default: route.component },
      instances: {},
      name: name,
      parent: parent,
      matchAs: matchAs,
      redirect: route.redirect,
      beforeEnter: route.beforeEnter,
      meta: route.meta || {},
      props: route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
    };
  
    if (route.children) {
      // Warn if route is named, does not redirect and has a default child route.
      // If users navigate to this route by name, the default child will
      // not be rendered (GH Issue #629)
      {
        if (route.name && !route.redirect && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
          warn(
            false,
            "Named Route '" + (route.name) + "' has a default child route. " +
            "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
            "the default child route will not be rendered. Remove the name from " +
            "this route and use the name of the default child route for named " +
            "links instead."
          );
        }
      }
      route.children.forEach(function (child) {
        let childMatchAs = matchAs
          ? cleanPath((matchAs + "/" + (child.path)))
          : undefined;
        addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
      });
    }
  
    if (route.alias !== undefined) {
      let aliases = Array.isArray(route.alias)
        ? route.alias
        : [route.alias];
  
      aliases.forEach(function (alias) {
        let aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord(
          pathList,
          pathMap,
          nameMap,
          aliasRoute,
          parent,
          record.path || '/' // matchAs
        );
      });
    }
  
    if (!pathMap[record.path]) {
      pathList.push(record.path);
      pathMap[record.path] = record;
    }
  
    if (name) {
      if (!nameMap[name]) {
        nameMap[name] = record;
      } else if ("development" !== 'production' && !matchAs) {
        warn(
          false,
          "Duplicate named routes definition: " +
          "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
        );
      }
    }
  }
  
  function compileRouteRegex (path, pathToRegexpOptions) {
    let regex = pathToRegexp_1(path, [], pathToRegexpOptions);
    {
      let keys = Object.create(null);
      regex.keys.forEach(function (key) {
        warn(!keys[key.name], ("Duplicate param keys in route with path: \"" + path + "\""));
        keys[key.name] = true;
      });
    }
    return regex
  }
  
  function normalizePath (path, parent, strict) {
    if (!strict) { path = path.replace(/\/$/, ''); }
    if (path[0] === '/') { return path }
    if (parent == null) { return path }
    return cleanPath(((parent.path) + "/" + path))
  }
  
  /*  */
  
  
  function normalizeLocation (
    raw,
    current,
    append,
    router
  ) {
    let next = typeof raw === 'string' ? { path: raw } : raw;
    // named target
    if (next.name || next._normalized) {
      return next
    }
  
    // relative params
    if (!next.path && next.params && current) {
      next = assign({}, next);
      next._normalized = true;
      let params = assign(assign({}, current.params), next.params);
      if (current.name) {
        next.name = current.name;
        next.params = params;
      } else if (current.matched.length) {
        let rawPath = current.matched[current.matched.length - 1].path;
        next.path = fillParams(rawPath, params, ("path " + (current.path)));
      } else {
        warn(false, "relative params navigation requires a current route.");
      }
      return next
    }
  
    let parsedPath = parsePath(next.path || '');
    let basePath = (current && current.path) || '/';
    let path = parsedPath.path
      ? resolvePath(parsedPath.path, basePath, append || next.append)
      : basePath;
  
    let query = resolveQuery(
      parsedPath.query,
      next.query,
      router && router.options.parseQuery
    );
  
    let hash = next.hash || parsedPath.hash;
    if (hash && hash.charAt(0) !== '#') {
      hash = "#" + hash;
    }
  
    return {
      _normalized: true,
      path: path,
      query: query,
      hash: hash
    }
  }
  
  function assign (a, b) {
    for (let key in b) {
      a[key] = b[key];
    }
    return a
  }
  
  /*  */
  
  
  function createMatcher (
    routes,
    router
  ) {
    let ref = createRouteMap(routes);
    let pathList = ref.pathList;
    let pathMap = ref.pathMap;
    let nameMap = ref.nameMap;
  
    function addRoutes (routes) {
      createRouteMap(routes, pathList, pathMap, nameMap);
    }
  
    function match (
      raw,
      currentRoute,
      redirectedFrom
    ) {
      let location = normalizeLocation(raw, currentRoute, false, router);
      let name = location.name;
  
      if (name) {
        let record = nameMap[name];
        {
          warn(record, ("Route with name '" + name + "' does not exist"));
        }
        if (!record) { return _createRoute(null, location) }
        let paramNames = record.regex.keys
          .filter(function (key) { return !key.optional; })
          .map(function (key) { return key.name; });
  
        if (typeof location.params !== 'object') {
          location.params = {};
        }
  
        if (currentRoute && typeof currentRoute.params === 'object') {
          for (let key in currentRoute.params) {
            if (!(key in location.params) && paramNames.indexOf(key) > -1) {
              location.params[key] = currentRoute.params[key];
            }
          }
        }
  
        if (record) {
          location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
          return _createRoute(record, location, redirectedFrom)
        }
      } else if (location.path) {
        location.params = {};
        for (let i = 0; i < pathList.length; i++) {
          let path = pathList[i];
          let record$1 = pathMap[path];
          if (matchRoute(record$1.regex, location.path, location.params)) {
            return _createRoute(record$1, location, redirectedFrom)
          }
        }
      }
      // no match
      return _createRoute(null, location)
    }
  
    function redirect (
      record,
      location
    ) {
      let originalRedirect = record.redirect;
      let redirect = typeof originalRedirect === 'function'
          ? originalRedirect(createRoute(record, location, null, router))
          : originalRedirect;
  
      if (typeof redirect === 'string') {
        redirect = { path: redirect };
      }
  
      if (!redirect || typeof redirect !== 'object') {
        {
          warn(
            false, ("invalid redirect option: " + (JSON.stringify(redirect)))
          );
        }
        return _createRoute(null, location)
      }
  
      let re = redirect;
      let name = re.name;
      let path = re.path;
      let query = location.query;
      let hash = location.hash;
      let params = location.params;
      query = re.hasOwnProperty('query') ? re.query : query;
      hash = re.hasOwnProperty('hash') ? re.hash : hash;
      params = re.hasOwnProperty('params') ? re.params : params;
  
      if (name) {
        // resolved named direct
        let targetRecord = nameMap[name];
        {
          assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
        }
        return match({
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params
        }, undefined, location)
      } else if (path) {
        // 1. resolve relative redirect
        let rawPath = resolveRecordPath(path, record);
        // 2. resolve params
        let resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
        // 3. rematch with existing query and hash
        return match({
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash
        }, undefined, location)
      } else {
        {
          warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
        }
        return _createRoute(null, location)
      }
    }
  
    function alias (
      record,
      location,
      matchAs
    ) {
      let aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
      let aliasedMatch = match({
        _normalized: true,
        path: aliasedPath
      });
      if (aliasedMatch) {
        let matched = aliasedMatch.matched;
        let aliasedRecord = matched[matched.length - 1];
        location.params = aliasedMatch.params;
        return _createRoute(aliasedRecord, location)
      }
      return _createRoute(null, location)
    }
  
    function _createRoute (
      record,
      location,
      redirectedFrom
    ) {
      if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
      }
      if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
      }
      return createRoute(record, location, redirectedFrom, router)
    }
  
    return {
      match: match,
      addRoutes: addRoutes
    }
  }
  
  function matchRoute (
    regex,
    path,
    params
  ) {
    let m = path.match(regex);
  
    if (!m) {
      return false
    } else if (!params) {
      return true
    }
  
    for (let i = 1, len = m.length; i < len; ++i) {
      let key = regex.keys[i - 1];
      let val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
      if (key) {
        params[key.name] = val;
      }
    }
  
    return true
  }
  
  function resolveRecordPath (path, record) {
    return resolvePath(path, record.parent ? record.parent.path : '/', true)
  }
  
  /*  */
  
  
  let positionStore = Object.create(null);
  
  function setupScroll () {
    // Fix for #1585 for Firefox
    window.history.replaceState({ key: getStateKey() }, '');
    window.addEventListener('popstate', function (e) {
      saveScrollPosition();
      if (e.state && e.state.key) {
        setStateKey(e.state.key);
      }
    });
  }
  
  function handleScroll (
    router,
    to,
    from,
    isPop
  ) {
    if (!router.app) {
      return
    }
  
    let behavior = router.options.scrollBehavior;
    if (!behavior) {
      return
    }
  
    {
      assert(typeof behavior === 'function', "scrollBehavior must be a function");
    }
  
    // wait until re-render finishes before scrolling
    router.app.$nextTick(function () {
      let position = getScrollPosition();
      let shouldScroll = behavior(to, from, isPop ? position : null);
  
      if (!shouldScroll) {
        return
      }
  
      if (typeof shouldScroll.then === 'function') {
        shouldScroll.then(function (shouldScroll) {
          scrollToPosition((shouldScroll), position);
        }).catch(function (err) {
          {
            assert(false, err.toString());
          }
        });
      } else {
        scrollToPosition(shouldScroll, position);
      }
    });
  }
  
  function saveScrollPosition () {
    let key = getStateKey();
    if (key) {
      positionStore[key] = {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
  }
  
  function getScrollPosition () {
    let key = getStateKey();
    if (key) {
      return positionStore[key]
    }
  }
  
  function getElementPosition (el, offset) {
    let docEl = document.documentElement;
    let docRect = docEl.getBoundingClientRect();
    let elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - docRect.left - offset.x,
      y: elRect.top - docRect.top - offset.y
    }
  }
  
  function isValidPosition (obj) {
    return isNumber(obj.x) || isNumber(obj.y)
  }
  
  function normalizePosition (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : window.pageXOffset,
      y: isNumber(obj.y) ? obj.y : window.pageYOffset
    }
  }
  
  function normalizeOffset (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : 0,
      y: isNumber(obj.y) ? obj.y : 0
    }
  }
  
  function isNumber (v) {
    return typeof v === 'number'
  }
  
  function scrollToPosition (shouldScroll, position) {
    let isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      let el = document.querySelector(shouldScroll.selector);
      if (el) {
        let offset = shouldScroll.offset && typeof shouldScroll.offset === 'object' ? shouldScroll.offset : {};
        offset = normalizeOffset(offset);
        position = getElementPosition(el, offset);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }
  
    if (position) {
      window.scrollTo(position.x, position.y);
    }
  }
  
  /*  */
  
  let supportsPushState = inBrowser && (function () {
    let ua = window.navigator.userAgent;
  
    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false
    }
  
    return window.history && 'pushState' in window.history
  })();
  
  // use User Timing api (if present) for more accurate key precision
  let Time = inBrowser && window.performance && window.performance.now
    ? window.performance
    : Date;
  
  let _key = genKey();
  
  function genKey () {
    return Time.now().toFixed(3)
  }
  
  function getStateKey () {
    return _key
  }
  
  function setStateKey (key) {
    _key = key;
  }
  
  function pushState (url, replace) {
    saveScrollPosition();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    let history = window.history;
    try {
      if (replace) {
        history.replaceState({ key: _key }, '', url);
      } else {
        _key = genKey();
        history.pushState({ key: _key }, '', url);
      }
    } catch (e) {
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }
  
  function replaceState (url) {
    pushState(url, true);
  }
  
  /*  */
  
  function runQueue (queue, fn, cb) {
    let step = function (index) {
      if (index >= queue.length) {
        cb();
      } else {
        if (queue[index]) {
          fn(queue[index], function () {
            step(index + 1);
          });
        } else {
          step(index + 1);
        }
      }
    };
    step(0);
  }
  
  /*  */
  
  function resolveAsyncComponents (matched) {
    return function (to, from, next) {
      let hasAsync = false;
      let pending = 0;
      let error = null;
  
      flatMapComponents(matched, function (def, _, match, key) {
        // if it's a function and doesn't have cid attached,
        // assume it's an async component resolve function.
        // we are not using Vue's default async resolving mechanism because
        // we want to halt the navigation until the incoming component has been
        // resolved.
        if (typeof def === 'function' && def.cid === undefined) {
          hasAsync = true;
          pending++;
  
          let resolve = once(function (resolvedDef) {
            if (isESModule(resolvedDef)) {
              resolvedDef = resolvedDef.default;
            }
            // save resolved on async factory in case it's used elsewhere
            def.resolved = typeof resolvedDef === 'function'
              ? resolvedDef
              : _Vue.extend(resolvedDef);
            match.components[key] = resolvedDef;
            pending--;
            if (pending <= 0) {
              next();
            }
          });
  
          let reject = once(function (reason) {
            let msg = "Failed to resolve async component " + key + ": " + reason;
            "development" !== 'production' && warn(false, msg);
            if (!error) {
              error = isError(reason)
                ? reason
                : new Error(msg);
              next(error);
            }
          });
  
          let res;
          try {
            res = def(resolve, reject);
          } catch (e) {
            reject(e);
          }
          if (res) {
            if (typeof res.then === 'function') {
              res.then(resolve, reject);
            } else {
              // new syntax in Vue 2.3
              let comp = res.component;
              if (comp && typeof comp.then === 'function') {
                comp.then(resolve, reject);
              }
            }
          }
        }
      });
  
      if (!hasAsync) { next(); }
    }
  }
  
  function flatMapComponents (
    matched,
    fn
  ) {
    return flatten(matched.map(function (m) {
      return Object.keys(m.components).map(function (key) { return fn(
        m.components[key],
        m.instances[key],
        m, key
      ); })
    }))
  }
  
  function flatten (arr) {
    return Array.prototype.concat.apply([], arr)
  }
  
  let hasSymbol =
    typeof Symbol === 'function' &&
    typeof Symbol.toStringTag === 'symbol';
  
  function isESModule (obj) {
    return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
  }
  
  // in Webpack 2, require.ensure now also returns a Promise
  // so the resolve/reject functions may get called an extra time
  // if the user uses an arrow function shorthand that happens to
  // return that Promise.
  function once (fn) {
    let called = false;
    return function () {
      let args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];
  
      if (called) { return }
      called = true;
      return fn.apply(this, args)
    }
  }
  
  /*  */
  
  let History = function History (router, base) {
    this.router = router;
    this.base = normalizeBase(base);
    // start with a route object that stands for "nowhere"
    this.current = START;
    this.pending = null;
    this.ready = false;
    this.readyCbs = [];
    this.readyErrorCbs = [];
    this.errorCbs = [];
  };
  
  History.prototype.listen = function listen (cb) {
    this.cb = cb;
  };
  
  History.prototype.onReady = function onReady (cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  };
  
  History.prototype.onError = function onError (errorCb) {
    this.errorCbs.push(errorCb);
  };
  
  History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
      let this$1 = this;
  
    let route = this.router.match(location, this.current);
    this.confirmTransition(route, function () {
      this$1.updateRoute(route);
      onComplete && onComplete(route);
      this$1.ensureURL();
  
      // fire ready cbs once
      if (!this$1.ready) {
        this$1.ready = true;
        this$1.readyCbs.forEach(function (cb) { cb(route); });
      }
    }, function (err) {
      if (onAbort) {
        onAbort(err);
      }
      if (err && !this$1.ready) {
        this$1.ready = true;
        this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
      }
    });
  };
  
  History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
      let this$1 = this;
  
    let current = this.current;
    let abort = function (err) {
      if (isError(err)) {
        if (this$1.errorCbs.length) {
          this$1.errorCbs.forEach(function (cb) { cb(err); });
        } else {
          warn(false, 'uncaught error during route navigation:');
          console.error(err);
        }
      }
      onAbort && onAbort(err);
    };
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      route.matched.length === current.matched.length
    ) {
      this.ensureURL();
      return abort()
    }
  
    let ref = resolveQueue(this.current.matched, route.matched);
      let updated = ref.updated;
      let deactivated = ref.deactivated;
      let activated = ref.activated;
  
    let queue = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(function (m) { return m.beforeEnter; }),
      // async components
      resolveAsyncComponents(activated)
    );
  
    this.pending = route;
    let iterator = function (hook, next) {
      if (this$1.pending !== route) {
        return abort()
      }
      try {
        hook(route, current, function (to) {
          if (to === false || isError(to)) {
            // next(false) -> abort navigation, ensure current URL
            this$1.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' && (
              typeof to.path === 'string' ||
              typeof to.name === 'string'
            ))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort();
            if (typeof to === 'object' && to.replace) {
              this$1.replace(to);
            } else {
              this$1.push(to);
            }
          } else {
            // confirm transition and pass on the value
            next(to);
          }
        });
      } catch (e) {
        abort(e);
      }
    };
  
    runQueue(queue, iterator, function () {
      let postEnterCbs = [];
      let isValid = function () { return this$1.current === route; };
      // wait until async components are resolved before
      // extracting in-component enter guards
      let enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
      let queue = enterGuards.concat(this$1.router.resolveHooks);
      runQueue(queue, iterator, function () {
        if (this$1.pending !== route) {
          return abort()
        }
        this$1.pending = null;
        onComplete(route);
        if (this$1.router.app) {
          this$1.router.app.$nextTick(function () {
            postEnterCbs.forEach(function (cb) { cb(); });
          });
        }
      });
    });
  };
  
  History.prototype.updateRoute = function updateRoute (route) {
    let prev = this.current;
    this.current = route;
    this.cb && this.cb(route);
    this.router.afterHooks.forEach(function (hook) {
      hook && hook(route, prev);
    });
  };
  
  function normalizeBase (base) {
    if (!base) {
      if (inBrowser) {
        // respect <base> tag
        let baseEl = document.querySelector('base');
        base = (baseEl && baseEl.getAttribute('href')) || '/';
        // strip full URL origin
        base = base.replace(/^https?:\/\/[^\/]+/, '');
      } else {
        base = '/';
      }
    }
    // make sure there's the starting slash
    if (base.charAt(0) !== '/') {
      base = '/' + base;
    }
    // remove trailing slash
    return base.replace(/\/$/, '')
  }
  
  function resolveQueue (
    current,
    next
  ) {
    let i;
    let max = Math.max(current.length, next.length);
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }
  
  function extractGuards (
    records,
    name,
    bind,
    reverse
  ) {
    let guards = flatMapComponents(records, function (def, instance, match, key) {
      let guard = extractGuard(def, name);
      if (guard) {
        return Array.isArray(guard)
          ? guard.map(function (guard) { return bind(guard, instance, match, key); })
          : bind(guard, instance, match, key)
      }
    });
    return flatten(reverse ? guards.reverse() : guards)
  }
  
  function extractGuard (
    def,
    key
  ) {
    if (typeof def !== 'function') {
      // extend now so that global mixins are applied.
      def = _Vue.extend(def);
    }
    return def.options[key]
  }
  
  function extractLeaveGuards (deactivated) {
    return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
  }
  
  function extractUpdateHooks (updated) {
    return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
  }
  
  function bindGuard (guard, instance) {
    if (instance) {
      return function boundRouteGuard () {
        return guard.apply(instance, arguments)
      }
    }
  }
  
  function extractEnterGuards (
    activated,
    cbs,
    isValid
  ) {
    return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
      return bindEnterGuard(guard, match, key, cbs, isValid)
    })
  }
  
  function bindEnterGuard (
    guard,
    match,
    key,
    cbs,
    isValid
  ) {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, function (cb) {
        next(cb);
        if (typeof cb === 'function') {
          cbs.push(function () {
            // #750
            // if a router-view is wrapped with an out-in transition,
            // the instance may not have been registered at this time.
            // we will need to poll for registration until current route
            // is no longer valid.
            poll(cb, match.instances, key, isValid);
          });
        }
      })
    }
  }
  
  function poll (
    cb, // somehow flow cannot infer this is a function
    instances,
    key,
    isValid
  ) {
    if (instances[key]) {
      cb(instances[key]);
    } else if (isValid()) {
      setTimeout(function () {
        poll(cb, instances, key, isValid);
      }, 16);
    }
  }
  
  /*  */
  
  
  let HTML5History = (function (History$$1) {
    function HTML5History (router, base) {
      let this$1 = this;
  
      History$$1.call(this, router, base);
  
      let expectScroll = router.options.scrollBehavior;
  
      if (expectScroll) {
        setupScroll();
      }
  
      let initLocation = getLocation(this.base);
      window.addEventListener('popstate', function (e) {
        let current = this$1.current;
  
        // Avoiding first `popstate` event dispatched in some browsers but first
        // history route not updated since async guard at the same time.
        let location = getLocation(this$1.base);
        if (this$1.current === START && location === initLocation) {
          return
        }
  
        this$1.transitionTo(location, function (route) {
          if (expectScroll) {
            handleScroll(router, route, current, true);
          }
        });
      });
    }
  
    if ( History$$1 ) HTML5History.__proto__ = History$$1;
    HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
    HTML5History.prototype.constructor = HTML5History;
  
    HTML5History.prototype.go = function go (n) {
      window.history.go(n);
    };
  
    HTML5History.prototype.push = function push (location, onComplete, onAbort) {
      let this$1 = this;
  
      let ref = this;
      let fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        pushState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
      let this$1 = this;
  
      let ref = this;
      let fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        replaceState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    HTML5History.prototype.ensureURL = function ensureURL (push) {
      if (getLocation(this.base) !== this.current.fullPath) {
        let current = cleanPath(this.base + this.current.fullPath);
        push ? pushState(current) : replaceState(current);
      }
    };
  
    HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
      return getLocation(this.base)
    };
  
    return HTML5History;
  }(History));
  
  function getLocation (base) {
    let path = window.location.pathname;
    if (base && path.indexOf(base) === 0) {
      path = path.slice(base.length);
    }
    return (path || '/') + window.location.search + window.location.hash
  }
  
  /*  */
  
  
  let HashHistory = (function (History$$1) {
    function HashHistory (router, base, fallback) {
      History$$1.call(this, router, base);
      // check history fallback deeplinking
      if (fallback && checkFallback(this.base)) {
        return
      }
      ensureSlash();
    }
  
    if ( History$$1 ) HashHistory.__proto__ = History$$1;
    HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
    HashHistory.prototype.constructor = HashHistory;
  
    // this is delayed until the app mounts
    // to avoid the hashchange listener being fired too early
    HashHistory.prototype.setupListeners = function setupListeners () {
      let this$1 = this;
  
      let router = this.router;
      let expectScroll = router.options.scrollBehavior;
      let supportsScroll = supportsPushState && expectScroll;
  
      if (supportsScroll) {
        setupScroll();
      }
  
      window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', function () {
        let current = this$1.current;
        if (!ensureSlash()) {
          return
        }
        this$1.transitionTo(getHash(), function (route) {
          if (supportsScroll) {
            handleScroll(this$1.router, route, current, true);
          }
          if (!supportsPushState) {
            replaceHash(route.fullPath);
          }
        });
      });
    };
  
    HashHistory.prototype.push = function push (location, onComplete, onAbort) {
      let this$1 = this;
  
      let ref = this;
      let fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        pushHash(route.fullPath);
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      let this$1 = this;
  
      let ref = this;
      let fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        replaceHash(route.fullPath);
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    HashHistory.prototype.go = function go (n) {
      window.history.go(n);
    };
  
    HashHistory.prototype.ensureURL = function ensureURL (push) {
      let current = this.current.fullPath;
      if (getHash() !== current) {
        push ? pushHash(current) : replaceHash(current);
      }
    };
  
    HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      return getHash()
    };
  
    return HashHistory;
  }(History));
  
  function checkFallback (base) {
    let location = getLocation(base);
    if (!/^\/#/.test(location)) {
      window.location.replace(
        cleanPath(base + '/#' + location)
      );
      return true
    }
  }
  
  function ensureSlash () {
    let path = getHash();
    if (path.charAt(0) === '/') {
      return true
    }
    replaceHash('/' + path);
    return false
  }
  
  function getHash () {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    let href = window.location.href;
    let index = href.indexOf('#');
    return index === -1 ? '' : href.slice(index + 1)
  }
  
  function getUrl (path) {
    let href = window.location.href;
    let i = href.indexOf('#');
    let base = i >= 0 ? href.slice(0, i) : href;
    return (base + "#" + path)
  }
  
  function pushHash (path) {
    if (supportsPushState) {
      pushState(getUrl(path));
    } else {
      window.location.hash = path;
    }
  }
  
  function replaceHash (path) {
    if (supportsPushState) {
      replaceState(getUrl(path));
    } else {
      window.location.replace(getUrl(path));
    }
  }
  
  /*  */
  
  
  let AbstractHistory = (function (History$$1) {
    function AbstractHistory (router, base) {
      History$$1.call(this, router, base);
      this.stack = [];
      this.index = -1;
    }
  
    if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
    AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
    AbstractHistory.prototype.constructor = AbstractHistory;
  
    AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
      let this$1 = this;
  
      this.transitionTo(location, function (route) {
        this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
        this$1.index++;
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      let this$1 = this;
  
      this.transitionTo(location, function (route) {
        this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
        onComplete && onComplete(route);
      }, onAbort);
    };
  
    AbstractHistory.prototype.go = function go (n) {
      let this$1 = this;
  
      let targetIndex = this.index + n;
      if (targetIndex < 0 || targetIndex >= this.stack.length) {
        return
      }
      let route = this.stack[targetIndex];
      this.confirmTransition(route, function () {
        this$1.index = targetIndex;
        this$1.updateRoute(route);
      });
    };
  
    AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      let current = this.stack[this.stack.length - 1];
      return current ? current.fullPath : '/'
    };
  
    AbstractHistory.prototype.ensureURL = function ensureURL () {
      // noop
    };
  
    return AbstractHistory;
  }(History));
  
  /*  */
  
  let VueRouter = function VueRouter (options) {
    if ( options === void 0 ) options = {};
  
    this.app = null;
    this.apps = [];
    this.options = options;
    this.beforeHooks = [];
    this.resolveHooks = [];
    this.afterHooks = [];
    this.matcher = createMatcher(options.routes || [], this);
  
    let mode = options.mode || 'hash';
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
    if (this.fallback) {
      mode = 'hash';
    }
    if (!inBrowser) {
      mode = 'abstract';
    }
    this.mode = mode;
  
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break
      default:
        {
          assert(false, ("invalid mode: " + mode));
        }
    }
  };
  
  let prototypeAccessors = { currentRoute: { configurable: true } };
  
  VueRouter.prototype.match = function match (
    raw,
    current,
    redirectedFrom
  ) {
    return this.matcher.match(raw, current, redirectedFrom)
  };
  
  prototypeAccessors.currentRoute.get = function () {
    return this.history && this.history.current
  };
  
  VueRouter.prototype.init = function init (app /* Vue component instance */) {
      let this$1 = this;
  
    "development" !== 'production' && assert(
      install.installed,
      "not installed. Make sure to call `Vue.use(VueRouter)` " +
      "before creating root instance."
    );
  
    this.apps.push(app);
  
    // main app already initialized.
    if (this.app) {
      return
    }
  
    this.app = app;
  
    let history = this.history;
  
    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation());
    } else if (history instanceof HashHistory) {
      let setupHashListener = function () {
        history.setupListeners();
      };
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      );
    }
  
    history.listen(function (route) {
      this$1.apps.forEach(function (app) {
        app._route = route;
      });
    });
  };
  
  VueRouter.prototype.beforeEach = function beforeEach (fn) {
    return registerHook(this.beforeHooks, fn)
  };
  
  VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
    return registerHook(this.resolveHooks, fn)
  };
  
  VueRouter.prototype.afterEach = function afterEach (fn) {
    return registerHook(this.afterHooks, fn)
  };
  
  VueRouter.prototype.onReady = function onReady (cb, errorCb) {
    this.history.onReady(cb, errorCb);
  };
  
  VueRouter.prototype.onError = function onError (errorCb) {
    this.history.onError(errorCb);
  };
  
  VueRouter.prototype.push = function push (location, onComplete, onAbort) {
    this.history.push(location, onComplete, onAbort);
  };
  
  VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
    this.history.replace(location, onComplete, onAbort);
  };
  
  VueRouter.prototype.go = function go (n) {
    this.history.go(n);
  };
  
  VueRouter.prototype.back = function back () {
    this.go(-1);
  };
  
  VueRouter.prototype.forward = function forward () {
    this.go(1);
  };
  
  VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
    let route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute;
    if (!route) {
      return []
    }
    return [].concat.apply([], route.matched.map(function (m) {
      return Object.keys(m.components).map(function (key) {
        return m.components[key]
      })
    }))
  };
  
  VueRouter.prototype.resolve = function resolve (
    to,
    current,
    append
  ) {
    let location = normalizeLocation(
      to,
      current || this.history.current,
      append,
      this
    );
    let route = this.match(location, current);
    let fullPath = route.redirectedFrom || route.fullPath;
    let base = this.history.base;
    let href = createHref(base, fullPath, this.mode);
    return {
      location: location,
      route: route,
      href: href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  };
  
  VueRouter.prototype.addRoutes = function addRoutes (routes) {
    this.matcher.addRoutes(routes);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };
  
  Object.defineProperties( VueRouter.prototype, prototypeAccessors );
  
  function registerHook (list, fn) {
    list.push(fn);
    return function () {
      let i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    }
  }
  
  function createHref (base, fullPath, mode) {
    let path = mode === 'hash' ? '#' + fullPath : fullPath;
    return base ? cleanPath(base + '/' + path) : path
  }
  
  VueRouter.install = install;
  VueRouter.version = '3.0.1';
  
  if (inBrowser && window.Vue) {
    window.Vue.use(VueRouter);
  }
  
  return VueRouter;
  
  })));
