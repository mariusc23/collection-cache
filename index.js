;(function (root, factory) {
  'use strict';

  // UMD
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof define === 'function' && define.amd) {
    define(['lodash'], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(require('lodash'));
  }
  else {
    root.CollectionCache = factory(root._);
  }

}(this, function (_) {
  'use strict';

  /**
   * Creates new cache instance.
   * @class CollectionCache
   *
   * @example
   * var cache = new CollectionCache();
   * @param   {Object}  options           - Collection options.
   * @param   {String}  options.skipKey   - Key representing start index.
   * @param   {String}  options.limitKey  - Key representing length of requested data.
   * @returns {Object}                    - New cache instance.
   */
  function CollectionCache(options) {
    options = options || {};
    this.cache = {};
    this.skipKey = options.skipKey || 'skip';
    this.limitKey = options.limitKey || 'limit';
  }

  /**
   * Gets data from cache.
   *
   * @example
   * var result = cache.get({
   *   skip: 10,
   *   limit: 10
   * });
   * @param  {Object}    options                           - Request options. Separate cache is used for each unique set of options.
   * @param  {Number}    options.skip                      - Start index of requested data.
   * @param  {Number}    options.limit                     - Length of requested data. `(endIndex - startIndex)`
   * @param  {CollectionCache~fallbackCallback}  callback  - Callback accepting two parameters: `cb(err, data)`
   * @returns                                              - Callback result.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.get = function(options, callback) {
    var cacheKey = getCacheKey.call(this, options),
        start = options[this.skipKey] || 0,
        end = (options[this.skipKey] + options[this.limitKey]) || undefined,
        data = [];

    if (this.cache[cacheKey]) {
      data = toArray(this.cache[cacheKey].data);
    }

    if (!callback) {
      callback = fallbackCallback;
    }

    return callback.call(this, undefined, data.slice(start, end));
  };

  /**
   * Gets all data from cache. Same as `.get()`, but returning all available data.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.all = function(options, callback) {
    var unlimit = {};
    unlimit[this.skipKey] = 0;
    unlimit[this.limitKey] = undefined;
    return this.get.call(this, _.extend({}, options, unlimit), callback);
  };

  /**
   * Add data to cache.
   *
   * @example
   * cache.add({
   *   skip: 10,
   *   limit: 10,
   * }, [1, 2], function(err, data) {
   *   if (err) { return console.error(err); }
   *   console.log(data);
   * });
   * @param  {Object}    options   - Options.
   * @param  {Object}    data      - Data to append to cache.
   * @param  {Function}  callback  - Callback accepting two parameters: `cb(err, data)`
   * @memberof CollectionCache
   */
  CollectionCache.prototype.add = function(options, data, callback) {
    if (!Array.isArray(data)) {
      return callback.call(this, new Error('Data must be an array.'), []);
    }

    options = _.extend({
      skip: 0
    }, options);

    var cacheKey = getCacheKey.call(this, options),
        i;

    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = {
        data: {}
      };
    }

    if (options.skip > this.cache[cacheKey].data.length + 1) {
      console.warn('Sparse cache area detected. Skip must be less than or equal to cache length.');
    }

    for (i = 0; i < data.length; i++) {
      this.cache[cacheKey].data[options[this.skipKey] + i] = data[i];
    }

    return callback.call(this, undefined, toArray(this.cache[cacheKey].data).slice(options[this.skipKey], options[this.limitKey]));
  };

  // Utils
  /**
   * Converts options to hash key.
   *
   * @example
   * getCacheKey({});
   * @param  {Object}  options  - Object to create hash from.
   * @private
   */
  function getCacheKey(options) {
    /*jshint validthis:true */
    var result = '';
    return _.forOwn(
      _.defaults(
        {
          __CACHE__: '__CACHE__' // If no options except skip & limit.
        },
        _.without(options, [this.skipKey, this.limitKey])
      ),
      function(option, key) {
        result += key + '=' + option;
      }
    );
  }

  /**
   * Converts object to array while keeping indexes accurate.
   *
   * @param  {Object}  obj  - Object to iterate over.
   * @return {Array}
   * @private
   */
  function toArray(obj) {
    var result = [],
        keys =_.keys(obj), // TODO: should sort?
        length = keys[keys.length - 1],
        i = -1;

    while (i++ < length) {
      result[i] = obj[i];
    }

    return result;
  }

  /**
   * Returns data if no callback specified. Defined once to save memory.
   *
   * @callback CollectionCache~fallbackCallback
   * @param  {Object}  err     - Error object.
   * @param  {Object}  result  - Resulting array.
   * @return {Array}
   * @private
   */
  function fallbackCallback(err, result) {
    return result;
  }

  return CollectionCache;
}));
