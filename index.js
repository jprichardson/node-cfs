var fs = require('fs')
var os = require('os')
var path = require('path')
var WriteStream = fs.WriteStream

function createWriteStream (fn, options) {
  var tmpFile = Math.random().toString().slice(2) + '.tmp'
  var defaultPath = fn() || path.join(os.tmpdir(), tmpFile)
  var ws = new WriteStream(defaultPath, options)

  var oldWrite = ws._write
  ws._write = function (data, encoding, done) {
    var newPath = fn(data, encoding)

    // no sense closing and opening if it's the same
    if (newPath === ws.path) {
      return oldWrite.call(ws, data, encoding, done)
    }

    if (ws.fd == null) {
      openNewPath()
    } else {
      fs.close(ws.fd, openNewPath)
    }

    function openNewPath () {
      ws.path = newPath
      fs.open(ws.path, ws.flags, ws.mode, function (err, fd) {
        if (err) {
          ws.destroy()
          ws.emit('error', err)
          return
        }

        ws.fd = fd
        oldWrite.call(ws, data, encoding, done)
      })
    }
  }

  return ws
}

module.exports = {
  createWriteStream: createWriteStream
}
