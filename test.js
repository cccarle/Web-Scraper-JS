const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')

const starting_url = 'https://en.wikipedia.org/wiki/Gaming'
const MAX_PAGE_COUNT = 200

var count = 0
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

    var articalName = $('h1').text()
    const body = $('div .mw-parser-output')
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

    if (count < MAX_PAGE_COUNT) {
      count++
      saveLinks(articalName, linkArray)
      storeRAWHTML(linkArray)
    }

    linkArray = []
  } catch (error) {
    console.error(error)
  }
}

const saveLinks = (articalName, linkArray) => {
  fs.writeFile(
    `./Links/${articalName}.txt`,
    linkArray.map(link => link + '\n'),
    err => {
      if (err) {
        return console.log(err)
      }
    }
  )
}

/* 
While count is below 200 ( max_pax_count ) 
Store raw html and crawl for new links
*/

const storeRAWHTML = linkArray => {
  const wiki_url = 'https://en.wikipedia.org/'
  linkArray.map(link => fetchHTML(wiki_url + link))
}

/* 
Store RAW HTML in ./rawHTML folder
*/

const fetchHTML = async link => {
  count++

  try {
    await pipeline(
      got.stream(link),
      fs.createWriteStream(`./rawHTML/index${count}.html`)
    )
  } catch (error) {
    console.error(error)
  }
}

start(starting_url)
