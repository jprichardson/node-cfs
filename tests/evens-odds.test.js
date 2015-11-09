var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')
var ospath = require('ospath')
var cfs = require('../')

/* global after, beforeEach, describe, it */
// trinity: mocha

var TEST_DIR = ''

describe('cfs', function () {
  beforeEach(function (done) {
    TEST_DIR = path.join(ospath.tmp(), 'cfs')
    fs.emptyDir(TEST_DIR, done)
  })

  after(function (done) {
    fs.remove(TEST_DIR, done)
  })

  it('should create each file and write to each appropriate file', function (done) {
    var someDir = Math.random().toString().slice(2)
    var evensFile = path.join(TEST_DIR, someDir, 'evens.txt')
    var oddsFile = path.join(TEST_DIR, someDir, 'odds.txt')
    var MAX = 100000

    var options = {
      flags: 'a',
      encoding: 'utf8',
      mode: parseInt('666', 8)
    }

    var writer = cfs.createWriteStream(function (data, encoding) {
      if (data == null) return null

      if (parseInt(data.toString('utf8'), 10) % 2 === 0) {
        return evensFile
      } else {
        return oddsFile
      }
    }, options)

    writer.on('finish', function () {
      var evensData = fs.readFileSync(evensFile, 'utf8').trim()
      var oddsData = fs.readFileSync(oddsFile, 'utf8').trim()
      evensData = evensData.split('\n').map(function (n) { return +n })
      oddsData = oddsData.split('\n').map(function (n) { return +n })

      assert(evensData.reduce(function (prev, n) { return prev && (n % 2 === 0) }, true))
      assert(oddsData.reduce(function (prev, n) { return prev && (n % 2 !== 0) }, true))

      assert.deepEqual(evensData.slice(0, 5), [2, 4, 6, 8, 10])
      assert.deepEqual(oddsData.slice(0, 5), [1, 3, 5, 7, 9])

      done()
    })

    for (var i = 1; i <= MAX; ++i) {
      writer.write(i + '\n')
    }

    writer.end()
  })
})
