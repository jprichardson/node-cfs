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
    TEST_DIR = path.join(ospath.tmp(), 'cfs-basic')
    fs.emptyDir(TEST_DIR, done)
  })

  after(function (done) {
    fs.remove(TEST_DIR, done)
  })

  it('should create each file and write to each appropriate file', function (done) {
    var someFile = path.join(TEST_DIR, 'some-file.txt')

    var options = {
      flags: 'a',
      encoding: 'utf8',
      mode: parseInt('666', 8)
    }

    var writer = cfs.createWriteStream(function (data, encoding) {
      if (data == null) return null
      return someFile
    }, options)

    writer.on('finish', function () {
      var data = fs.readFileSync(someFile, 'utf8')
      // console.dir(data)
      assert.strictEqual(data, '{"first":"JP"}\n{"last":"Richardson"}\n')

      done()
    })

    writer.write(JSON.stringify({ first: 'JP' }) + '\n')
    writer.write(JSON.stringify({ last: 'Richardson' }) + '\n')

    writer.end()
  })
})
