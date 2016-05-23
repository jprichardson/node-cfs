var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var LRU = require('lru-cache')
var Writable = require('stream').Writable

function createWriteStream (pathResolver, options) {
  var cacheOptions = Object.assign({
    max: 100,
    dispose: cacheDispose,
    maxAge: 1000 * 60 * 60
  }, options.cacheOptions)

  var cfs = new Writable()
  cfs._writesPending = 0
  cfs._cache = LRU(cacheOptions)

  cfs._write = function (data, encoding, done) {
    cfs._writesPending += 1
    var newPath = pathResolver(data, encoding)
    var ws = this._cache.get(newPath)
    if (ws) {
      ws.write(data, encoding, function () { cfs._writesPending -= 1 })
      done()
    } else {
      var dir = path.dirname(newPath)
      mkdirp(dir, function (err) {
        if (err) return cfs.emit('error', err)
        var newws = fs.createWriteStream(newPath, options)
        newws.on('error', function (err) { cfs.emit('error', err) })
        cfs._cache.set(newPath, newws)
        newws.write(data, encoding, function () { cfs._writesPending -= 1 })
        done()
      })
    }
  }

  // won't see performance boost in Node v4
  cfs._writev = null

  var oldEnd = cfs.end.bind(cfs)
  cfs.end = function (data, encoding, callback) {
    if (data) cfs._write(data, encoding)

    var pendingCheck = setInterval(function () {
      // console.log(cfs._writesPending)
      if (cfs._writesPending > 0) return
      clearInterval(pendingCheck)
      cfs._cache.reset()
      callback && callback()
    }, 50)
  }

  // maybe put something here...
  cfs.once('finish', function () { })

  function cacheDispose (filePath, ws) {
    var cache = this
    ws.end(function () {
      if (cache.itemCount === 0) oldEnd() // trigger 'finish' event
    })
  }

  return cfs
}

module.exports = {
  createWriteStream: createWriteStream
}
