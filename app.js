const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')

const starting_url = 'https://en.wikipedia.org/wiki/Gaming'
const MAX_PAGE_COUNT = 200

let count = -1
let linkArray = []

const start = async starting_url => {
  await findLinks(starting_url)
}

/* 
Find all links from starting_url,
Crawl to all hrefs the starting_url include
Stores the links raw html.
*/

const findLinks = async starting_url => {
  try {
    const response = await got(starting_url)
    const $ = cheerio.load(response.body)
    const links = $('a')

    $(links).each(function(i, link) {
      const link_adress = $(link).attr('href')
      if (link_adress != undefined && link_adress.includes('https://')) {
        linkArray.push(link_adress)
      }
    })
  } catch (error) {
    console.error(error)
  }

  storeRAWHTML(linkArray)
}

/* 
While count is below 200 ( max_pax_count ) 
Store raw html and crawl for new links
*/

const storeRAWHTML = linkArray => {
  while (count < MAX_PAGE_COUNT) {
    linkArray.map(link =>
      fetchHTML(link).then(() => {
        findLinks(link)
      })
    )
  }
}

/* 
Store RAW HTML in ./rawHTML folder
*/

const fetchHTML = async link => {
  count++

  while (count < MAX_PAGE_COUNT) {
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

start(starting_url)
