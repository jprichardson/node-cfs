var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')
var cfs = require('./')

/* global beforeEach, describe, it */

var TEST_DIR = ''

describe('cfs', function() {
  beforeEach(function() {
    TEST_DIR = createTestDir()
  })

  it('should create each file and write to each appropriate file', function(done) {
    var evensFile = path.join(TEST_DIR, 'evens.txt')
    var oddsFile = path.join(TEST_DIR, 'odds.txt')

    var options = {
      flags: 'a',
      encoding: 'utf8',
      mode: parseInt('666', 8)
    }

    var writer = cfs.createWriteStream(function(data, encoding) {
      if (data == null) return null

      if (+data.toString('utf8') % 2 === 0)
        return evensFile
      else
        return oddsFile
    }, options)

    writer.on('finish', function() {
      var evensData = fs.readFileSync(evensFile, 'utf8')
      var oddsData = fs.readFileSync(oddsFile, 'utf8')

      assert.equal(evensData, [2, 4, 6, 8, 10].join('\n') + '\n')
      assert.equal(oddsData, [1, 3, 5, 7, 9].join('\n') + '\n')

      done()
    })

    for (var i = 1; i <= 10; ++i) {
      writer.write(i + '\n')
    }

    writer.end()
  })
})

function createTestDir () {
  var tmp = require('os').platform().indexOf('win') === 0
    ? process.env.HOME
    : '/tmp'

  var dir = path.join(tmp, 'cfs')

  if (fs.existsSync(dir)) {
    var files = fs.readdirSync(dir)
    files.forEach(function(file) {
      return fs.removeSync(path.join(dir, file))
    })
  } else {
    fs.mkdirSync(dir)
  }

  return dir
}
