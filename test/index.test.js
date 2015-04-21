var CollectionCache = require('../index');
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
    this.cache = new CollectionCache();
    done();
  },

  instantiation: function(test) {
    test.expect(3);

    test.equal(this.cache instanceof CollectionCache, true, 'Is instance of constructor.');
    test.equal(this.cache.skipKey, 'skip', 'Has default skip key.');
    test.equal(this.cache.limitKey, 'limit', 'Has default limit key.');

    test.done();
  },

  addNoOptions: function (test) {
    test.expect(2);

    test.equal(this.cache.addSync({ a:0 }, [1, 2, 3]).length, 3, '[sync] Added 3 items');

    this.cache.add({}, [1, 2, 3]).then(function(result) {
      test.equal(result.length, 3, 'Added 3 items.');
      test.done();
    });
  },

  addSparse: function (test) {
    test.expect(4);

    this.cache.add({ skip: 10 }, [1, 2, 3]).then(function(result) {
      test.equal(result.length, 3, 'Returns the 3 added items.');
      test.equal(result[result.length - 1], 3, 'Last item is correct.');

      this.cache.all({}).then(function(result) {
        test.equal(result.length, 13, 'Array contains empty indices.');
        test.equal(result[0], undefined, 'Array has undefined for empty index.');
        test.done();
      });
    }.bind(this));
  },

  edit: function (test) {
    test.expect(4);

    this.cache.add({}, [1, 2, 3]).then(function(result) {
      test.equal(result.length, 3, 'Has 3 items.');
      test.equal(result[2], 3, 'Last item is 3.');

      this.cache.add({ skip: 2 }, [4]).then(function(result) {
        test.equal(result.length, 1, 'Returns modified item.');
        test.equal(result[0], 4, 'Value modified.');
        test.done();
      });
    }.bind(this));
  },

  editSparse: function (test) {
    test.expect(4);

    this.cache.add({}, [1, 2, 3]).then(function(result) {
      test.equal(result.length, 3, 'Has 3 items.');
      test.equal(result[2], 3, 'Last item is 3.');

      this.cache.add({ skip: 9 }, [4]).then(function(result) {
        test.equal(result[0], 4, 'Value added.');

        this.cache.all({}).then(function(result) {
          test.equal(result.length, 10, 'Has 10 items.');
          test.done();
        });
      }.bind(this));
    }.bind(this));
  },

  get: function(test) {
    test.expect(3);

    this.cache.add({}, [1, 2, 3]).then(function(result) {

      test.equal(this.cache.getSync({}).length, 3, '[sync] Returns everything.');

      this.cache.get({}).then(function(result) {
        test.equal(result.length, 3, 'Returns everything.');

        this.cache.get({ skip: 1, limit: 1 }).then(function(result) {
          test.equal(result.length, 1, 'Returns only skip and limit range.');
          test.done();
        });
      }.bind(this));
    }.bind(this));
  }

};
