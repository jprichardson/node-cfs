Node.js: conditional file streams
=================================

[![build status](https://secure.travis-ci.org/jprichardson/node-cfs.svg)](http://travis-ci.org/jprichardson/node-cfs)
[![Coverage Status](https://img.shields.io/coveralls/jprichardson/node-cfs.svg)](https://coveralls.io/r/jprichardson/node-cfs)

Write to a file stream based upon some condition. Currently only writable fs streams. 


Why?
----

Maybe you want to have just one writable file stream in your application and based upon the date, it writes to different files.


Usage
-----

    npm install -g cfs


### Example

```js
var cfs = require('cfs')
var ymd = require('ymd')

var options = {
  flags: 'a',
  encoding: 'utf8',
  mode: parseInt('666', 8)
}

var logWriter = cfs.createWriteStream(function(data, encoding) {
  // get date in YYYY-MM-dd
  var date = ymd(new Date())
  return date + '.txt'
}, options)

logWriter.write(someLogData)
```

License
-------

MIT

