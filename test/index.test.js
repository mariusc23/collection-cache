var CollectionCache = require('../index');
var async = require('async');
var _ = require('lodash');

module.exports = {
  setUp: function (done) {
    this.cache = new CollectionCache();
    this.cacheAreaOneOptions = {
      sort: 'date'
    };
    done();
  },

  tearDown: function (done) {
    this.cache.destroy();
    done();
  },

  instantiation: function(test) {
    test.expect(3);

    test.equal(this.cache instanceof CollectionCache, true, 'Is instance of constructor.');
    test.equal(this.cache.skipKey, 'skip', 'Has default skip key.');
    test.equal(this.cache.limitKey, 'limit', 'Has default limit key.');

    test.done();
  },

  queue: function (test) {
    test.expect(7);

    var cache = this.cache;
    var options = {};
    var count = 0;

    async.each([1, 2, 3, 4, 5], function(count, next) {
      count++;
      cache.get(
        options,
        function(err, data) {
          if (count <= 3) {
            test.equal(data.toString(), '1,2,3', 'Got initial data.');
          }
          else {
            test.equal(data.toString(), '4,5,6', 'Got modified data.');
          }
          if (count === 3) {
            test.equal(cache.add(options, [4, 5, 6]).toString(), '4,5,6', 'Changed data.');
          }
          next();
        },
        function(addToCache) {
          setTimeout(function() {
            addToCache([1, 2, 3]);
          }, 0);
        }
      );
    }, function(err) {
      cache.add(options, [7, 8, 9]);
      cache.get(options, function(err, data) {
        test.equal(data.toString(), '7,8,9', 'Got final data');
      });
      test.done();
    });
  },

  sync: function(test) {
    test.expect(5);

    var options = {};
    var modifiedOptions = { skip: 2 };

    test.equal(this.cache.add(options, [1, 2, 3]).toString(), '1,2,3', 'Added sync data.');
    test.equal(this.cache.get(options).toString(), '1,2,3', 'Got sync data.');

    test.equal(this.cache.add(modifiedOptions, [4, 5, 6]).toString(), '4,5,6', 'Modified sync data.');
    test.equal(this.cache.get(modifiedOptions).toString(), '4,5,6', 'Got modified sync data.');

    test.equal(this.cache.all(modifiedOptions).toString(), '1,2,4,5,6', 'Got all sync data.');

    test.done();
  },

  update: function(test) {
    test.expect(2);

    var item = {
      id: 'cache',
      a: 'a'
    };

    test.equal(
      JSON.stringify(this.cache.update(item.id, item)),
      JSON.stringify(item),
      'Updated item.'
    );

    test.equal(
      JSON.stringify(this.cache.show(item.id)),
      JSON.stringify(item),
      'Showed item.'
    );

    test.done();
  },

  existing: function(test) {
    test.expect(2);

    var options = {};
    var options2 = { z: 'z' };

    var item = {
      id: '1',
      a: 'a'
    };

    var item2 = {
      id: '2',
      b: 'b'
    };

    var item3 = {
      id: '3',
      c: 'c'
    };

    this.cache.add(options, [item, item2]);
    this.cache.add(options2, [item2, item]);

    this.cache.update(item2.id, item3);

    test.equal(
      JSON.stringify(this.cache.get(options)[1]),
      JSON.stringify(_.extend({}, item2, item3)),
      'Updated item in first cache area.'
    );

    test.equal(
      JSON.stringify(this.cache.get(options2)[0]),
      JSON.stringify(_.extend({}, item2, item3)),
      'Updated item in second cache area.'
    );

    test.done();
  },

};
