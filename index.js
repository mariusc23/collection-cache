;(function (root, factory) {
  'use strict';

  // UMD
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'es6-promise'], factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory(require('lodash'), require('es6-promise').Promise);
  }
  else {
    root.CollectionCache = factory(root._, root.ES6Promise);
  }

}(this, function (_, Promise) {
  'use strict';

  /**
   * Creates new cache instance.
   * @class CollectionCache
   *
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
   * @param  {Object}    options        - Request options. Separate cache is used for each unique set of options.
   * @param  {Number}    options.skip   - Start index of requested data.
   * @param  {Number}    options.limit  - Length of requested data. `(endIndex - startIndex)`
   * @returns                           - Promise.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.get = function(options) {
    return new Promise(function(resolve) {
      var cacheKey = getCacheKey.call(this, options),
          start = options[this.skipKey] || 0,
          end = (options[this.skipKey] + options[this.limitKey]) || undefined,
          data = [];

      if (this.cache[cacheKey]) {
        data = toArray(this.cache[cacheKey].data).slice(start, end);
      }

      return resolve(data);
    }.bind(this));
  };

  /**
   * Gets all data from cache. Same as `.get()`, but returning all available data.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.all = function(options) {
    var unlimit = {};
    unlimit[this.skipKey] = 0;
    unlimit[this.limitKey] = undefined;
    return CollectionCache.prototype.get.call(this, _.extend({}, options, unlimit));
  };

  /**
   * Add data to cache.
   *
   * @param  {Object}    options   - Options.
   * @param  {Object}    data      - Data to append to cache.
   * @returns                      - Promise.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.add = function(options, data) {
    return new Promise(function(resolve, reject) {
      if (!Array.isArray(data)) {
        var err = new Error('Data must be an array.');
        if (reject) { reject(err); }
        return err;
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

      return resolve(data);
    }.bind(this));
  };

  // Utils
  /**
   * Converts options to hash key.
   *
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

  return CollectionCache;
}));
