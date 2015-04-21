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

#### Add items to cache
```js
fruits.add(queryParams, ['apples', 'oranges'], function(err, cachedFruits) {
  if (err) { throw err; }
  console.log(cachedFruits);
});

// or shorthand
var cachedFruits = fruits.add(queryParams, ['apples', 'oranges']);
```

#### Get items from cache
```js
fruits.get(queryParams, function(err, cachedFruits) {
  if (err) { throw err; }
  console.log(cachedFruits);
});

// or shorthand
var cachedFruits = fruits.get(queryParams);
```

#### All together now
```js
var deferred = $.Deferred();

// Check if already cached
fruits.get(queryParams, function(err, cachedFruits) {
  // If cached, return cached version
  if (cachedFruits.length) {
    deferred.resolve(cachedFruits);
  }
  // Otherwise, fetch from backend
  else {
    $http({
      url: '/fruits',
      method: 'GET',
      params: queryParams
    }).success(function(newFruits) {
      // And cache response
      fruits.add(queryParams, newFruits);
      deferred.resolve(newFruits);
    });
  }
});

return deferred.promise;
```

## License
Copyright (c) 2015 Marius Craciunoiu. Licensed under the MIT license.
