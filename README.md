Node.js: conditional file streams
=================================

[![build status](https://secure.travis-ci.org/jprichardson/node-cfs.svg)](http://travis-ci.org/jprichardson/node-cfs)
[![windows Build status](https://img.shields.io/appveyor/ci/jprichardson/node-cfs/master.svg?label=windows%20build)](https://ci.appveyor.com/project/jprichardson/node-cfs/branch/master)
[![Coverage Status](https://coveralls.io/repos/jprichardson/node-cfs/badge.svg?branch=master&service=github)](https://coveralls.io/github/jprichardson/node-cfs?branch=master)

Writable file stream that can write to different files based upon the condition
of what's being written. i.e. Intead of passing `filePath` as the first
parameter to your stream, you pass a function that returns the path.

This saves you time because you no longer have to manage many different writable streams.


Use Case
--------

Best use case is to only have one writable fs stream that writes log files, except the log file
path changes depending up the date or log data.



Usage
-----

    npm i --save cfs


### Example 1

Write log data to different files depending upon the date.

```js
var cfs = require('cfs')
var path = require('path')
var ymd = require('ymd')

var pathFn = function () {
  // get date in YYYY-MM-dd
  var date = ymd(new Date())
  return path.join('/tmp/logs/' + date + '.txt')
}

var logWriter = cfs.createWriteStream(pathFn, { flags: 'a' })
logWriter.write(someLogData)
```

### Example 2

Write data to different files depending upon what's being written.
Write even numbers to `evens.txt` and odd numbers to `odds.txt`.

No need to worry about opening a bunch of files. File descriptors
are cached.

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
Also, `cacheOptions` which are the options that you'd pass to [`lru-cache`](https://github.com/isaacs/node-lru-cache).

License
-------

MIT

Copyright (c) [JP Richardson](https://github.com/jprichardson)
