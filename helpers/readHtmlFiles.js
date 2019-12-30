const path = require('path')
const fs = require('fs')

/* 
Reads all downloaded html files from './rawHTML'
*/

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err)
      return
    }
    filenames.forEach(function(filename) {
      fs.readFile(path.resolve(dirname, filename), 'utf-8', function(
        err,
        content
      ) {
        if (err) {
          return
        }
        onFileContent(filename, content)
      })
    })
  })
}

module.exports = {
  readFiles
}
