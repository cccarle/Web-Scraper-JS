const { readFiles } = require('../helpers/readHtmlFiles')
const cheerio = require('cheerio')
const path = require('path')
const fs = require('fs')

let linkArray = []
let wordArray = []

/* 
For each html file in '../rawHTML'
Scrape for links & words
*/

const scrapeHTML = () => {
  readFiles(
    path.resolve(__dirname, '../rawHTML'),
    async function(filename, content) {
      const $ = cheerio.load(content)
      const body = $('div .mw-parser-output')

      let articalName = $('h1').text()

      findWords($, 'div .mw-parser-output *')
      findLinks($, body)

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

/* 
Finds all links in body, filter unnecessary characters
Add to linkArray
*/

const findLinks = ($, body) => {
  const links = body.find('a')

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
}

/* 
Finds all words in body, filter & trim unnecessary characters
Add to wordArray
*/

const findWords = ($, query) => {
  let words = $(query)
    .contents()
    .map(function() {
      return this.type === 'text' ? $(this).text() + ' ' : ''
    })
    .get()
    .join('')

  let arrayOfWords = (words = words.split(' ')) // make words in to array
  let filteredArrayOfWords = arrayOfWords.filter(word =>
    word.trim().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
  )

  filteredArrayOfWords.map(word => wordArray.push(word))
}

/* 
Creates a .txt with the articals name + the links it contains
*/

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

/* 
Creates a .txt with the articals name + the words it contains
*/

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

module.exports = {
  scrapeHTML
}
