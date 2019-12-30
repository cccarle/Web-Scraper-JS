const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')
const MAX_PAGE_COUNT = 200

let count = 0
let linkArray = []
let pages = []
let breakTheLoop = false

/* 
Visit url as long as page we visited is below or equeal to 200
Get HTML content from link, finds all links in the body and stores & visit
for more links.
*/

const scrapeAndStoreHTML = async link => {
  while (pages.length <= MAX_PAGE_COUNT && !breakTheLoop) {
    if (pages.length === 200) {
      breakTheLoop = true
      return console.log('200 RAW html-pages is downloaded')
    }

    const response = await got(link)
    const $ = cheerio.load(response.body)
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

    storeRAWHTML(linkArray) // visits all links a page has with scrapeAndStoreHTML(), kind of recursion.

    linkArray = []
  }
}

/* 
Store raw html and crawl for new links
For every new link call scrapeAndStoreHTML(with the links in linkarray),
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
  Adds link to pages we visited to now when to stop.
  */

const fetchHTML = async link => {
  count++

  var index = link.indexOf('wiki/')

  let html_page_name = link
    .slice(index + 5)
    .trim()
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')

  while ((pages.length < MAX_PAGE_COUNT) & !breakTheLoop) {
    pages.push(link)
    try {
      await pipeline(
        got.stream(link),
        fs.createWriteStream(`./rawHTML/${html_page_name + count}.html`)
      )
    } catch (error) {
      // console.error(error)
    }
  }
}

module.exports = {
  scrapeAndStoreHTML
}
