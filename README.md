Node.js: conditional file streams
=================================

[![build status](https://secure.travis-ci.org/jprichardson/node-cfs.svg)](http://travis-ci.org/jprichardson/node-cfs)
[![Coverage Status](https://img.shields.io/coveralls/jprichardson/node-cfs.svg)](https://coveralls.io/r/jprichardson/node-cfs)

Writable file stream that can write to different files based upon the condition
of what's being written. i.e. Intead of passing `filePath` as the first
parameter to your stream, you pass a function that returns the path.

This saves you time because you no longer have to manage many different writable streams.


Use Case
--------

The biggest use case is to only have one writable fs stream that writes log files, except the log file
path changes depending up the date.



Usage
-----

    npm install -g cfs


### Example 1

Write log data to different files depending upon the date.

```js
var cfs = require('cfs')
var ymd = require('ymd')

var pathFn = function () {
  // get date in YYYY-MM-dd
  var date = ymd(new Date())
  return date + '.txt'
}

var logWriter = cfs.createWriteStream(pathFn, { flags: 'a' })
logWriter.write(someLogData)
```

### Example 2

Write data to different files depending upon what's being written.
Write even numbers to `evens.txt` and odd numbers to `odds.txt`.

```js
var cfs = require('cfs')

var pathFn = function (data) {
  if (data == null) return null

  if (parseInt(data.toString('utf8'), 10) % 2 === 0) {
    return 'evens.txt'
  } else {
    return 'odds.txt'
  }
}

var logWriter = cfs.createWriteStream(pathFn, { flags: 'a' })
logWriter.write(someLogData)
```

### API

#### createWriteStream()

- `pathFunction`: A function that should return the path. Method signature `(data, encoding)`.
- `options`: These are the standard options that you'd pass to [`fs.createWriteStream`](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).

License
-------

MIT

