collection-cache
================

> Simple request data caching.

[![npm](https://img.shields.io/npm/v/collection-cache.svg)](https://www.npmjs.com/package/collection-cache)
[![bower](https://img.shields.io/bower/v/collection-cache.svg)](https://github.com/mariusc23/collection-cache)
[![build status](https://travis-ci.org/mariusc23/collection-cache.svg)](https://travis-ci.org/mariusc23/collection-cache)

## Getting Started

#### Create a new cache instance

```js
var fruits = new CacheCollection();
```

#### Assuming...
```js
var queryParams = {
  sort: 'name',
  skip: 0,
  limit: 10
};
```

#### Querying and Updating
```js
var deferred = $.Deferred();

fruits.get(
  queryParams,
  function(err, cachedFruits) {
    deferred.resolve(cachedFruits);
  },
  function(addToCache) {
    $http({
      url: '/fruits',
      method: 'GET',
      params: queryParams
    }).success(function(newFruits) {
      addToCache(newFruits);
      deferred.resolve(newFruits);
    });
  }
);

return deferred.promise;
```

#### Synchronous Updates
```js
fruits.add(queryParams, ['apples', 'oranges']);
```

#### Synchronous Retrievals
```js
var cachedFruits = fruits.get(queryParams);
```

## License
Copyright (c) 2015 Marius Craciunoiu. Licensed under the MIT license.
