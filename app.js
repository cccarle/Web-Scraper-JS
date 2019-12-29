const got = require('got')
const fs = require('fs')
const stream = require('stream')
const { promisify } = require('util')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')

const links = 'https://sindresorhus.com'
const MAX_PAGE_COUNT = 200
const count = 0
let linkArray = []
const start = async () => {
  await fetchHTML(links, count)
  await findLinks()
}

const findLinks = async () => {
  try {
    const response = await got('https://sindresorhus.com')
    const $ = cheerio.load(response.body)
    const links = $('a') // get all hyperlinks

    $(links).each(function(i, link) {
      // console.log($(link).attr('href'))

      if (
        $(link).attr('href') != undefined &&
        $(link)
          .attr('href')
          .includes('https://')
      ) {
        linkArray.push($(link).attr('href'))
      }
    })
  } catch (error) {
    console.log(error.response.body)
  }

  console.log(linkArray)
}

const fetchHTML = async (link, count) => {
  try {
    const response = await pipeline(
      got.stream(link),
      fs.createWriteStream('./rawHTML/index.html')
    )
  } catch (error) {
    console.error(error)
  }
}

start()
