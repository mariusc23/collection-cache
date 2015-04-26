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
    root.CollectionCache = factory(root._, root.ES6Promise.Promise);
  }

}(this, function (_, Promise) {
  'use strict';

  /**
   * Creates new cache instance.
   * @class CollectionCache
   *
   * @param   {Object}  options           - Collection options.
   * @param   {String}  options.idKey     - Key representing item id.
   * @param   {String}  options.skipKey   - Key representing start index.
   * @param   {String}  options.limitKey  - Key representing length of requested data.
   * @returns {Object}                    - New cache instance.
   */
  function CollectionCache(options) {
    options = options || {};
    this.cache = {};
    this.queue = {};
    this.items = {};
    this.idKey = options.idKey || 'id';
    this.skipKey = options.skipKey || 'skip';
    this.limitKey = options.limitKey || 'limit';
  }

  /**
   * Gets requested items from cache.
   *
   * @param  {Object}    options        - Request options. Separate cache is used for each unique set of options.
   * @param  {Number}    options.skip   - Start index of requested data.
   * @param  {Number}    options.limit  - Length of requested data. `(endIndex - startIndex)`
   * @param  {Function}  callback       - Callback to be invoked when data is retrieved.
   * @param  {Function}  getter         - Callback to be invoked when data needs to be retrieved.
   * @returns - Cached data (only if available and returned by callback).
   * @memberof CollectionCache
   */
  CollectionCache.prototype.get = function(options, callback, getter) {
    var cacheKey = getCacheKey.call(this, options),
        queueKey = getQueueKey(options),
        start = options[this.skipKey] || 0,
        end = (options[this.skipKey] + options[this.limitKey]) || undefined,
        cacheArea = this.cache[cacheKey],
        cachedItems = [];

    // Add synchronous support (must always be added first)
    if (!callback) {
      callback = fallbackCallback;
    }

    if (cacheArea) {
      cachedItems = cacheArea.slice(start, end);
    }

    // Cached
    if (cacheArea && !end || cachedItems.length >= options[this.limitKey]) {
      return callback(undefined, cachedItems);
    }
    // Not cached: first uncached request
    else if (!this.queue[queueKey]) {
      if (!getter) {
        return callback(new Error('Data not in cache and missing getter function.'));
      }

      this.queue[queueKey] = new Promise(function(resolve, reject) {
        getter(resolve, reject);
      });

      this.queue[queueKey].then(function(data) {
        this.add(options, data);
      }.bind(this));
    }
    // Not cached: first and subsequent uncached requests
    this.queue[queueKey]
      .then(function(/* data */) {
        callback(undefined, this.cache[cacheKey].slice(start, end));
      }.bind(this))
      .catch(function(err) {
        // console.error(err);
        callback(err);
      });
  };

  /**
   * Gets all request data from cache. Same as `.get()`, but returning all available data.
   *
   * @memberof CollectionCache
   */
  CollectionCache.prototype.all = function(options, callback, getter) {
    var unlimit = {};
    unlimit[this.skipKey] = 0;
    unlimit[this.limitKey] = undefined;
    return CollectionCache.prototype.get.call(this, _.extend({}, options, unlimit), callback, getter);
  };

  /**
   * Create/add data to cache area.
   *
   * @param  {Object}  options  - Options.
   * @param  {Array}   data     - Data to add.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.add = function(options, data) {
    if (!Array.isArray(data)) {
      return new Error('Data must be an array.');
    }

    var defaultOptions = {};
    defaultOptions[this.skipKey] = 0;

    options = _.extend(defaultOptions, options);

    var cacheKey = getCacheKey.call(this, options),
        i;

    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = [];
    }

    if (options.skip > this.cache[cacheKey].length + 1) {
      console.warn('Sparse cache area detected. Skip must be less than or equal to cache length.');
    }

    for (i = 0; i < data.length; i++) {
      this.update(data[i][this.idKey], data[i]);
      this.cache[cacheKey][options[this.skipKey] + i] = this.items[data[i][this.idKey]];
    }

    return data;
  };

  /**
   * Lists all unique items in the cache.
   *
   * @memberof CollectionCache
   */
  CollectionCache.prototype.list = function() {
    return _.toArray(this.items);
  };

  /**
   * Retrieve cached item.
   *
   * @param  {String}  id  - Id of item.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.show = function(id) {
    return this.items[id];
  };

  /**
   * Update cached item in all cache areas.
   *
   * @param  {String}        id    - Id of item.
   * @param  {Object|Array}  data  - Data to update/replace.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.update = function(id, data) {
    // TODO: emit events?
    this.items[id] = _.extend(this.items[id] || {}, data);
    return this.items[id];
  };

  /**
   * Remove cached item in all cache areas.
   *
   * @param  {String}  id  - Id of item.
   * @memberof CollectionCache
   */
  CollectionCache.prototype.remove = function(id) {
    _.forOwn(this.cache, function(cacheArea) {
      _.remove(cacheArea, function(value) {
        return value[this.idKey] === id;
      }.bind(this));
    }.bind(this));
    return delete this.items[id];
  };

  /**
   * Clears cache.
   *
   * @memberof CollectionCache
   */
  CollectionCache.prototype.destroy = function() {
    this.cache = [];
    this.queue = {};
    this.items = {};
  };

  /**
   * Converts options to cache hash key.
   *
   * @param  {Object}  options  - Object to create hash from.
   * @private
   */
  function getCacheKey(options) {
    /*jshint validthis:true */
    var result = '';
    _.forOwn(
      _.defaults(
        {
          __CACHE__: '__CACHE__' // If no options except skip & limit.
        },
        _.omit(options, [this.skipKey, this.limitKey])
      ),
      function(option, key) {
        result += key + '=' + option;
      }
    );
    return result;
  }

  /**
   * Converts options to queue hash key.
   *
   * @param  {Object}  options  - Object to create hash from.
   * @private
   */
  function getQueueKey(options) {
    var result = '';
    _.forOwn(
      _.defaults(
        {
          __CACHE__: '__CACHE__' // If no options except skip & limit.
        },
        options
      ),
      function(option, key) {
        result += key + '=' + option;
      }
    );
    return result;
  }

  /**
   * Returns data if no callback specified. Defined once to save memory.
   *
   * @param  {Object}  err     - Error object.
   * @param  {Object}  result  - Resulting array.
   * @return {Array}
   * @private
   */
  function fallbackCallback(err, result) {
    return result || err;
  }

  return CollectionCache;
}));
