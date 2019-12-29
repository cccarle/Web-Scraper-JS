const { promisify } = require('util')
const fs = require('fs')
const got = require('got')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)
const cheerio = require('cheerio')

const starting_link = 'https://en.wikipedia.org/wiki/Gaming'
const MAX_PAGE_COUNT = 200

let count = -1
let linkArray = []

const start = async starting_link => {
  await findLinks(starting_link)
}

const findLinks = async starting_link => {
  try {
    const response = await got(starting_link)
    const $ = cheerio.load(response.body)
    const links = $('a') // get all hyperlinks

    $(links).each(function(i, link) {
      const link_adress = $(link).attr('href')
      if (link_adress != undefined && link_adress.includes('https://')) {
        linkArray.push(link_adress)
      }
    })
  } catch (error) {
    console.error(error)
  }

  console.log(linkArray)

  while (count < MAX_PAGE_COUNT) {
    linkArray.map(link =>
      fetchHTML(link).then(() => {
        findLinks(link)
      })
    )
  }
}

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

start(starting_link)
