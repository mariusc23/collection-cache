collection-cache
================

> Simple request data caching.

[![npm](https://img.shields.io/npm/v/collection-cache.svg)](https://www.npmjs.com/package/collection-cache)
[![bower](https://img.shields.io/bower/v/collection-cache.svg)](https://github.com/mariusc23/collection-cache)
[![build status](https://travis-ci.org/mariusc23/collection-cache.svg)](https://travis-ci.org/mariusc23/collection-cache)

## Getting Started

This module is used to cache backend data.

- It has a queueing system to prevent multiple requests for the same data.
- Data is tracked per request parameters (ex. sort method, etc.)
- Data is stored in a single array (items are updated everywhere, regardless of request parameters).

It assumes data is stored as objects with ID keys.

#### Create a new cache instance

```js
var fruits = new CollectionCache();
```

The following options can be passed in to the constructor (defaults shown):
```js
{
  idKey: 'id',      // property that uniquely identifies object
  skipKey: 'skip',  // parameter representing start of data set
  limitKey: 'limit' // parameter representing amount of data stored
}
```

#### Assuming...
```js
var queryParams = {
  sort: 'name',
  skip: 0,
  limit: 10
};
```

#### Querying and Storing
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
    });
  }
);

return deferred.promise;
```

#### Find by ID
```js
var orange = fruits.show('orange');
// => { id: 'orange', category: 'citrus' }
```

#### Find by ID and Update
```js
fruits.update('orange', { category: 'berries' });
// => { id: 'orange', category: 'berries' }
```

#### Clear Cache
```js
fruits.destroy();
```

## License
Copyright (c) 2015 Marius Craciunoiu. Licensed under the MIT license.
