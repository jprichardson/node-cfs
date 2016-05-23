0.6.0 / 2016-05-23
------------------
- **Breaking** drop support for anything below Node v4.
- dropped `object-assign`

0.5.0 / 2015-11-09
------------------
- completely refactored. Maybe should be a different module? The API is still the
same. The major change is that before, `cfs` was **one** `fs.writeStream` that
changed file descriptors / paths. Now, `cfs` is a `Writable` stream that manages
multiple `fs.writeStreams`. The net effect is still the same. The API is still the
same.

0.4.0 / 2015-11-06
------------------
- ensure directory exists for the path returned

0.3.0 / 2015-10-22
------------------
- add support for Node v4
- add appveyor (windows ci)
- expose `cacheOptions` and `_cache`

0.2.0 / 2015-07-05
------------------
- added file descriptor caching

0.1.0 / 2015-02-03
------------------
- initial release
