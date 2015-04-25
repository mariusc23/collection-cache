var CollectionCache = require('../index');
var async = require('async');
var _ = require('lodash');

module.exports = {
  setUp: function (done) {
    this.cache = new CollectionCache();
    this.testOptions = [
      {},
      {
        z: 'z'
      }
    ];
    this.testItems = [
      {
        id: '1',
        a: 'a'
      },
      {
        id: '2',
        b: 'b'
      },
      {
        id: '3',
        c: 'c'
      }
    ];
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
    var options = this.testOptions[0];
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

    var options = this.testOptions[0];
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

    var item = this.testItems[0];

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

    var options = this.testOptions[0];
    var options2 = this.testOptions[1];

    var item1 = this.testItems[0];
    var item2 = this.testItems[1];
    var item3 = this.testItems[3];

    this.cache.add(options, [item1, item2]);
    this.cache.add(options2, [item2, item1]);

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

  list: function(test) {
    test.expect(1);

    var options = this.testOptions[0];
    var options2 = this.testOptions[1];

    var item1 = this.testItems[0];
    var item2 = this.testItems[1];
    var item3 = this.testItems[2];

    this.cache.add(options, [item1, item2]);
    this.cache.add(options2, [item3]);

    test.equal(
      JSON.stringify(this.cache.list()),
      JSON.stringify([item1, item2, item3]),
      'Lists all added items.'
    );

    test.done();
  },

  remove: function(test) {
    test.expect(3);

    var options = this.testOptions[0];
    var item1 = this.testItems[0];
    var item2 = this.testItems[1];

    this.cache.add(options, [item1, item2]);

    test.equal(
      JSON.stringify(this.cache.get(options)),
      JSON.stringify([item1, item2]),
      'Added both items.'
    );

    this.cache.remove(item1.id);

    test.equal(
      JSON.stringify(this.cache.get(options)),
      JSON.stringify([item2]),
      'Removed first item.'
    );

    test.equal(
      JSON.stringify(this.cache.items),
      JSON.stringify({ 2: item2 }),
      'Removed from items object.'
    );

    test.done();
  }

};
