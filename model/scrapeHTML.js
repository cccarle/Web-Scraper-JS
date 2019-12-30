const starting_url = 'https://en.wikipedia.org/wiki/Gaming'
const path = require('path')
var dir = require('node-dir')
const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')

let linkArray = []
let wordArray = []
const scrapeHTML = () => {
  readFiles(
    path.resolve(__dirname, '../rawHTML'),
    async function(filename, content) {
      const $ = cheerio.load(content)
      let articalName = $('h1').text()
      const body = $('div .mw-parser-output')
      const links = body.find('div .mw-parser-output')

      var words = $('div .mw-parser-output *')
        .contents()
        .map(function() {
          return this.type === 'text' ? $(this).text() + ' ' : ''
        })
        .get()
        .join('')

      let test = (words = words.split(' '))
      var newArr = test.filter(el =>
        el.trim().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
      )

      newArr.map(word => wordArray.push(word))

      $(links).each(function(i, link) {
        const link_adress = $(link).attr('href')

        if (
          link_adress != undefined &&
          link_adress.includes('/wiki/') &&
          !link_adress.includes('https://')
        ) {
          linkArray.push(link_adress)
        }
      })

      saveLinks(articalName, linkArray)
      saveWords(articalName, wordArray)

      linkArray = []
      wordArray = []
    },
    error => {
      //console.error(error)
    }
  )
}

const saveLinks = (articalName, linkArray) => {
  fs.writeFile(
    `./Links/${articalName}.txt`,
    linkArray.map(link => link + '\n'),
    err => {
      if (err) {
        // return console.log(err)
      }
    }
  )
}

const saveWords = (articalName, words) => {
  if (words.length > 0) {
    fs.writeFile(
      `./Words/${articalName}.txt`,
      words.map(word =>
        word.trim().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
      ),
      err => {
        if (err) {
          // return console.log(err)
        }
      }
    )
  }
}

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
          onError(err)
          return
        }
        onFileContent(filename, content)
      })
    })
  })
}

module.exports = {
  scrapeHTML
}
