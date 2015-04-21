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
    test.expect(1);

    this.cache.add({}, [1, 2, 3], function(err, result) {
      test.equal(result.length, 3, 'Added 3 items.');
    });

    test.done();
  },

  addSparse: function (test) {
    test.expect(2);

    this.cache.add({ skip: 10 }, [1, 2, 3], function(err, result) {
      test.equal(result[result.length - 1], 3, 'Last item is set.');
    });

    this.cache.all({}, function(err, result) {
      test.equal(result.length, 13, 'Not sparse array.');
    });

    test.done();
  },

  edit: function (test) {
    test.expect(4);

    this.cache.add({}, [1, 2, 3], function(err, result) {
      test.equal(result.length, 3, 'Has 3 items.');
      test.equal(result[2], 3, 'Last item is 3.');
    });

    this.cache.add({ skip: 2 }, [4], function(err, result) {
      test.equal(result.length, 1, 'Returns modified item.');
      test.equal(result[0], 4, 'Value modified.');
    });

    test.done();
  },

  editSparse: function (test) {
    test.expect(4);

    this.cache.add({}, [1, 2, 3], function(err, result) {
      test.equal(result.length, 3, 'Has 3 items.');
      test.equal(result[2], 3, 'Last item is 3.');
    });

    this.cache.add({ skip: 9 }, [4], function(err, result) {
      test.equal(result[0], 4, 'Value added.');
    });

    this.cache.all({}, function(err, result) {
      test.equal(result.length, 10, 'Has 10 items.');
    });

    test.done();
  },

  get: function(test) {
    test.expect(2);

    this.cache.add({}, [1, 2, 3], function(err, result) {

      this.cache.get({}, function(err, result) {
        test.equal(result.length, 3, 'Returns everything.');
      });

      this.cache.get({ skip: 1, limit: 1 }, function(err, result) {
        test.equal(result.length, 1, 'Returns only skip and limit range.');
      });

    }.bind(this));

    test.done();
  },

  getShorthand: function(test) {
    test.expect(2);

    this.cache.add({}, [1, 2, 3], function(err, result) {

      test.equal(this.cache.get({}).length, 3, 'Shorthand returns everything.');
      test.equal(this.cache.get({ skip: 1, limit: 1 }).length, 1, 'Shorthand returns only skip and limit range.');

    }.bind(this));

    test.done();
  }
};
