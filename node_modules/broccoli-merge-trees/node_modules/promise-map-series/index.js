var RSVP = require('rsvp')

module.exports = function promiseMapSeries (array, iterator, thisArg) {
  var results = new Array(array.length)
  var index = 0
  return array.reduce(function (promise, item) {
      return promise.then(function () {
          return iterator.call(thisArg, item, index, array)
        })
        .then(function (result) {
          results[index++] = result
        })
    }, RSVP.resolve())
    .then(function () {
      return results
    })
}
