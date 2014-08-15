var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var glob = require('glob')

var isWindows = /^win/.test(process.platform)
var pathSep   = path.sep

exports.hashTree = hashTree
function hashTree (fullPath) {
  // This function is used by the watcher. It makes the following guarantees:
  //
  // (1) It never throws an exception.
  //
  // (2) It does not miss changes. In other words, if after this function returns,
  // any part of the directory hierarchy changes, a subsequent call must
  // return a different hash.
  //
  // (1) and (2) hold even in the face of a constantly-changing file system.
  return hashStrings(keysForTree(fullPath))
}

function keysForTree (fullPath, options) {
  options = options || {}

  var _stack         = options._stack
  var _followSymlink = options._followSymlink
  var relativePath   = options.relativePath || '.'
  var stats
  var statKeys

  try {
    if (_followSymlink) {
      stats = fs.statSync(fullPath)
    } else {
      stats = fs.lstatSync(fullPath)
    }
  } catch (err) {
    console.warn('Warning: failed to stat ' + fullPath)
    // fullPath has probably ceased to exist. Leave `stats` undefined and
    // proceed hashing.
  }
  var childKeys = []
  if (stats) {
    statKeys = ['stats', stats.mode]
  } else {
    statKeys = ['stat failed']
  }
  if (stats && stats.isDirectory()) {
    var fileIdentity = stats.dev + '\x00' + stats.ino
    if (_stack != null && _stack.indexOf(fileIdentity) !== -1) {
      console.warn('Symlink directory loop detected at ' + fullPath + ' (note: loop detection may have false positives on Windows)')
    } else {
      if (_stack != null) _stack = _stack.concat([fileIdentity])
      var entries
      try {
        entries = fs.readdirSync(fullPath).sort()
      } catch (err) {
        console.warn('Warning: Failed to read directory ' + fullPath)
        console.warn(err.stack)
        childKeys = ['readdir failed']
        // That's all there is to say about this directory.
      }
      if (entries != null) {
        for (var i = 0; i < entries.length; i++) {

          var keys = keysForTree(path.join(fullPath, entries[i]), {
            _stack: _stack,
            relativePath: path.join(relativePath, entries[i])
          })
          childKeys = childKeys.concat(keys)
        }
      }
    }
  } else if (stats && stats.isSymbolicLink()) {
    if (_stack == null) {
      // From here on in the traversal, we need to guard against symlink
      // directory loops. _stack is kept null in the absence of symlinks to we
      // don't have to deal with Windows for now, as long as it doesn't use
      // symlinks.
      _stack = []
    }
    childKeys = keysForTree(fullPath, {_stack: _stack, relativePath: relativePath, _followSymlink: true}) // follow symlink
    statKeys.push(stats.mtime.getTime())
    statKeys.push(stats.size)
  } else if (stats && stats.isFile()) {
    statKeys.push(stats.mtime.getTime())
    statKeys.push(stats.size)
  }

  // Perhaps we should not use basename to infer the file name
  return ['path', relativePath]
    .concat(statKeys)
    .concat(childKeys)
}


exports.hashStats = hashStats
function hashStats (stats, path) {
  // Both stats and path can be null
  var keys = []
  if (stats != null) {
    keys.push(stats.mode, stats.size, stats.mtime.getTime())
  }
  if (path != null) {
    keys.push(path)
  }
  return hashStrings(keys)
}


exports.hashStrings = hashStrings
function hashStrings (strings) {
  var joinedStrings = strings.join('\x00')
  return crypto.createHash('md5').update(joinedStrings).digest('hex')
}


// If src is a file, dest is a file name. If src is a directory, dest is the
// directory that the contents of src will be copied into.
//
// This function refuses to overwrite files, but accepts if directories exist
// already.
//
// This does not resolve symlinks. It is not clear whether it should.
//
// Note that unlike cp(1), we do not special-case if dest is an existing
// directory, because relying on things to exist when we're in the middle of
// assembling a new tree is too brittle.
//
// We would like to use wrench.copyDirSyncRecursive, but it has the following
// problems:
// * Returns(!) an error when the target directory exists; only alternative
//   is { forceDelete: true }, which does `rm -rf dest` (not what we want)
// * Resolves symlinks, rather than copying them verbatim
exports.copyRecursivelySync = copyRecursivelySync
function copyRecursivelySync (src, dest, _mkdirp) {
  if (_mkdirp == null) _mkdirp = true
  // Note: We could try readdir'ing and catching ENOTDIR exceptions, but that
  // is 3x slower than stat'ing in the common case that we have a file.
  var srcStats = fs.lstatSync(src)
  if (srcStats.isDirectory()) {
    mkdirp.sync(dest)
    var entries = fs.readdirSync(src).sort()
    for (var i = 0; i < entries.length; i++) {
      // Set _mkdirp to false when recursing to avoid extra mkdirp calls.
      copyRecursivelySync(src + '/' + entries[i], dest + '/' + entries[i], false)
    }
  } else {
    if (_mkdirp) {
      mkdirp.sync(path.dirname(dest))
    }
    copyPreserveSync(src, dest, srcStats)
  }
}

// srcStats is optional; use it as an optimization to avoid double stats
// This function refuses to overwrite files.
exports.copyPreserveSync = copyPreserveSync
function copyPreserveSync (src, dest, srcStats) {
  if (srcStats == null) srcStats = fs.lstatSync(src)
  if (srcStats.isFile()) {
    var content = fs.readFileSync(src)
    fs.writeFileSync(dest, content, { flag: 'wx' })
    fs.utimesSync(dest, srcStats.atime, srcStats.mtime)
  } else if (srcStats.isSymbolicLink()) {
    fs.symlinkSync(fs.readlinkSync(src), dest)
    // We cannot update the atime/mtime of a symlink yet:
    // https://github.com/joyent/node/issues/2142
  } else {
    throw new Error('Unexpected file type for ' + src)
  }
}

exports.linkRecursivelySync = linkRecursivelySync
function linkRecursivelySync () {
  throw new Error('linkRecursivelySync has been removed; use copyRecursivelySync instead (note: it does not overwrite)')
}

exports.linkAndOverwrite = linkAndOverwrite
function linkAndOverwrite () {
  throw new Error('linkAndOverwrite has been removed; use copyPreserveSync instead (note: it does not overwrite)')
}


exports.assertAbsolutePaths = assertAbsolutePaths
function assertAbsolutePaths (paths) {
  for (var i = 0; i < paths.length; i++) {
    if (paths[i][0] !== '/') {
      throw new Error('Path must be absolute: "' + paths[i] + '"')
    }
  }
}


// Multi-glob with reasonable defaults, so APIs all behave the same
exports.multiGlob = multiGlob
function multiGlob (globs, globOptions) {
  if (!Array.isArray(globs)) {
    throw new TypeError("multiGlob's first argument must be an array");
  }
  var options = {
    nomount: true,
    strict: true
  }
  for (var key in globOptions) {
    if (globOptions.hasOwnProperty(key)) {
      options[key] = globOptions[key]
    }
  }

  var pathSet = {}
  var paths = []
  for (var i = 0; i < globs.length; i++) {
    if (options.nomount && globs[i][0] === '/') {
      throw new Error('Absolute paths not allowed (`nomount` is enabled): ' + globs[i])
    }
    var matches = glob.sync(globs[i], options)
    if (matches.length === 0) {
      throw new Error('Path or pattern "' + globs[i] + '" did not match any files')
    }
    for (var j = 0; j < matches.length; j++) {
      if (!pathSet[matches[j]]) {
        pathSet[matches[j]] = true
        paths.push(matches[j])
      }
    }
  }
  return paths
}

exports.symlinkOrCopyPreserveSync = symlinkOrCopyPreserveSync
function symlinkOrCopyPreserveSync (sourcePath, destPath) {
  if (isWindows) {
    copyRecursivelySync(sourcePath, destPath)
  } else {
    if (sourcePath[0] != pathSep) {
      sourcePath = process.cwd() + pathSep + sourcePath
    }

    fs.symlinkSync(sourcePath, destPath)
  }
}
