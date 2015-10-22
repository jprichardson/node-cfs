var assign = require('object-assign')
var fs = require('fs')
var LRU = require('lru-cache')
var os = require('os')
var path = require('path')
var WriteStream = fs.WriteStream

function createWriteStream (fn, options) {
  var defaultPath = fn() || tempFile()
  var ws = new WriteStream(defaultPath, options)

  function cacheDispose (filePath, fd) {
    fs.close(fd, function (err) {
      if (err) ws.emit('error', err)
    })
  }

  var cacheOptions = assign({
    max: 100,
    dispose: cacheDispose,
    maxAge: 1000 * 60 * 60
  }, options.cacheOptions)

  var cache = LRU(cacheOptions)

  ws.on('close', function () {
    cache.reset()
  })

  ws.on('finish', function () {
    cache.reset()
  })

  var oldWrite = ws._write
  ws._write = function (data, encoding, done) {
    var newPath = fn(data, encoding)

    // no sense closing and opening if it's the same
    if (newPath === ws.path) {
      return oldWrite.call(ws, data, encoding, done)
    } else {
      openNewPathAndWrite()
    }

    function openNewPathAndWrite () {
      ws.path = newPath
      var fd = cache.get(newPath)
      if (fd) {
        ws.fd = fd
        return oldWrite.call(ws, data, encoding, done)
      }

      // hacky solution for Node v4
      try {
        fd = fs.openSync(ws.path, ws.flags, ws.mode)
      } catch (err) {
        ws.destroy()
        ws.emit('error', err)
        return
      }

      ws.fd = fd
      cache.set(newPath, fd)
      oldWrite.call(ws, data, encoding, done)
    }
  }

  // won't see performance boost in Node v4
  ws._writev = function (chunks, done) {
    var len = chunks.length

    function callback () {
      len -= 1
      if (len === 0) done()
    }

    chunks.forEach(function (c) {
      setImmediate(function () {
        ws._write(c.chunk, c.encoding, callback)
      })
    })
  }

  // expose fd cache
  ws._cache = cache

  return ws
}

function tempFile () {
  var tmp = Math.random().toString().slice(2) + '.tmp'
  return path.join(os.tmpdir(), tmp)
}

module.exports = {
  createWriteStream: createWriteStream
}
