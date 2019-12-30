const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')
const MAX_PAGE_COUNT = 200

var count = 0
let linkArray = []
let pages = []
let breakTheLoop = false

const scrapeAndStoreHTML = async link => {
  while (pages.length <= MAX_PAGE_COUNT && !breakTheLoop) {
    if (pages.length === 200) {
      breakTheLoop = true
      return console.log('200 RAW html-pages is downloaded')
    }

    const response = await got(link)
    const $ = cheerio.load(response.body)

    const articalName = $('h1').text()
    const body = $('div .mw-parser-output')
    const links = body.find('a')

    $(links).each(function(i, link) {
      const link_adress = $(link).attr('href')

      if (
        link_adress != undefined &&
        link_adress.includes('/wiki/') &&
        !link_adress.includes('https://') &&
        !link_adress.includes('jpg') &&
        !link_adress.includes('svg') &&
        !link_adress.includes('  ')
      ) {
        linkArray.push(link_adress)
      }
    })

    storeRAWHTML(linkArray)

    linkArray = []
  }
}

/* 
While count is below 200 ( max_pax_count ) 
Store raw html and crawl for new links
*/

const storeRAWHTML = linkArray => {
  const wiki_url = 'https://en.wikipedia.org/'
  linkArray.map(link => {
    scrapeAndStoreHTML(wiki_url + link)
  })
  linkArray.map(link => fetchHTML(wiki_url + link))
}

/* 
  Store RAW HTML in ./rawHTML folder
  */

const fetchHTML = async link => {
  count++
  while ((pages.length < MAX_PAGE_COUNT) & !breakTheLoop) {
    pages.push(link)

    try {
      await pipeline(
        got.stream(link),
        fs.createWriteStream(`./rawHTML/index${count}.html`)
      )
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = {
  scrapeAndStoreHTML
}
