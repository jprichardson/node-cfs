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

  var cache = LRU({
    max: 100,
    dispose: cacheDispose,
    maxAge: 1000 * 60 * 60
  })

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

      fs.open(ws.path, ws.flags, ws.mode, function (err, fd) {
        if (err) {
          ws.destroy()
          ws.emit('error', err)
          return
        }

        ws.fd = fd
        cache.set(newPath, fd)
        oldWrite.call(ws, data, encoding, done)
      })
    }
  }

  return ws
}

function tempFile () {
  var tmp = Math.random().toString().slice(2) + '.tmp'
  return path.join(os.tmpdir(), tmp)
}

module.exports = {
  createWriteStream: createWriteStream
}
